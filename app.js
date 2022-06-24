const axios = require('axios');
const cheerio = require('cheerio');
const htmlparser2 = require('htmlparser2');


const linkManga = 'https://blogtruyen.vn/28770/initial-d';

function checkProtocol({ URLWebManga = '' }) {
  if(URLWebManga !== '') {
    return (new RegExp('^https?', 'g')).test(URLWebManga);
  }else {
    return new Error('URLWebManga not pass to funtion!');
  }
}

function completeDNS({ protocol = 'http', subdomain = '', domain = '', TLD = 'vn', urlPoint }) {
  return `${protocol}://${subdomain ? (subdomain + '.') : ''}${domain}.${TLD}${urlPoint}`;
}

(async () => {
  const res = await axios.get(linkManga);
  if(res.status === 200) {
    const dom = htmlparser2.parseDocument(res.data);
    const $ = cheerio.load(dom);
    console.log('Name: ', $('.main-content h1.entry-title').text().trim());
    console.log('Thumbnail: ', $('.main-content .thumbnail > img').attr('src'));
    let desc = $('.main-content .detail .content').clone().children().remove().end().text().trim().replace(/\s\s+/g, ' ');
    desc = (desc !== '') ? desc : $('.main-content .detail .content').text().trim().replace(/\s\s+/g, ' ');
    console.log(desc);
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
    })
    console.log(info.toArray());
    console.log('Update on blogtruyen: ', $('.main-content .description .row > .col-sm-6 > span').text());
    const dataChapters = $('#list-chapters p').map((index, element) => {
      const tempInfo = $(element).find('span.title > a');
      const tempDate = String($(element).find('span.publishedDate').text()).split(' ');
      const URLChapter = tempInfo.attr('href');
      return {
        name: tempInfo.text(),
        link: checkProtocol({ URLWebManga: URLChapter }) ? URLChapter : completeDNS({ protocol: 'https', domain: 'blogtruyen', TLD: 'vn', urlPoint: URLChapter }),
        create: {
          date: tempDate[0],
          hour: tempDate[1],
        },
      }
    }).toArray().reverse();
    console.log(dataChapters);
  }

})()
