const { formatDate, completeDNS, checkProtocol } = require('./helper.js');
const axios = require('axios');
const cheerio = require('cheerio');
const htmlparser2 = require('htmlparser2');

class blogtruyen {

  // [get information about manga, author, team-translate,...etc..]
  getInfo ({ $ }) {
  
    const info =  $('.main-content .description p').map((index, element) => {
      const temp = $(element).text();
      if(temp.includes('Tác giả:')) {
        return {
          Author: temp.split(':')[1].split(/\s\s+/g).filter(value => value !== ''),
        }
      }
      else if(temp.includes('Tên khác:')) {
        return {
          NameOther: temp.split(':')[1].split(/\s\s+/g).filter(value => value !== ''),
        }
      }
      else if(temp.includes('Nguồn:')) {
        return {
          Source: temp.split(':')[1].split(/\s\s+/g).filter(value => value !== ''),
        }
      }
      else if(temp.includes('Nhóm dịch:')) {
        return {
          TeamTranslate: temp.split(':')[1].split(/\s\s+/g).filter(value => value !== ''),
        }
      }
      else if(temp.includes('Thể loại:')) {
        return {
          Genres: temp.split(':')[1].split(/\s\s+/g).filter(value => value !== ''),
        }
      }
      else if(temp.includes('Đăng bởi:')) {
        const origin = temp.split(':');
        return {
          Origin: {
            PostBy: String(origin[1]).split('Trạng thái')[0].trim(),
            Status: String(origin[2]).trim(),
          },
        }
      }
    }).toArray();

    return info.reduce((previousValue, currentValue) => {
      return { ...previousValue, ...currentValue };
    }, {});
  
  }
  // [get decription about manga]
  getDesc({ $ }) {
  
    let descTemp = $('.main-content .detail .content').clone().children().remove().end().text().trim().replace(/\s\s+/g, ' ');
    return (descTemp !== '') ? descTemp : $('.main-content .detail .content').text().trim().replace(/\s\s+/g, ' ');
  
  }

  // [get list chapters of manga clone]
  getChapters({ $ }) {
  
    return $('#list-chapters p').map((index, element) => {
      const tempInfo = $(element).find('span.title > a');
      const URLChapter = tempInfo.attr('href');
      const tempDateFormated = formatDate($(element).find('span.publishedDate').text().trim());
      return {
        name: tempInfo.text(),
        link: checkProtocol({ URLWebManga: URLChapter }) ? URLChapter : completeDNS({ protocol: 'https', domain: 'blogtruyen', TLD: 'vn', urlPoint: URLChapter }),
        create: {
          date: tempDateFormated.date,
          hour: tempDateFormated.hour,
        },
      }
    }).toArray().reverse();
  
  }

  // [get list images of every one chapter]
  async getImagesChapter({ linkChapter }) {
    return new Promise(async (resovle, reject) => {
      try {
        const res = await axios.get(linkChapter);
        if(res.status === 200) {
          const dom = htmlparser2.parseDocument(res.data);
          const $ = cheerio.load(dom);
          resovle($('#content > img').map((index, element) => $(element).attr('src')).toArray());
        }else {
          reject(new Error('Miru request link chapter is error status code: ' + res.status));
        }
      } catch (error) {
        reject(new Error('Miru error => ' + error));
      }
    })

  }

  // [general of manga clone]
  async getGeneral({ $ }) {

    let general = new Object();
    let tempPromise = new Array();
    general.name = $('.main-content h1.entry-title').text().trim();
    general.thumbnail = $('.main-content .thumbnail > img').attr('src');
    general.info = this.getInfo({ $ });
    general.desc = this.getDesc({ $ });
    general.create_date = $('.main-content .description .row > .col-sm-6 > span').text().trim();
    general.chapters = this.getChapters({ $ });
    tempPromise = general.chapters.map(async (element, index) => {
      return {
        ...element,
        images: await this.getImagesChapter({ linkChapter: element.link }),
      }
    });
    general.chapters = await Promise.all(tempPromise);
    return general;

  }

}

module.exports = {
  blogtruyen: new blogtruyen,
}
