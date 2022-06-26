const { formatDate, completeDNS, checkProtocol, analysisDNS } = require("./helper.js");
const axios = require("axios");
const cheerio = require("cheerio");
const htmlparser2 = require("htmlparser2");

class commonStatement {

  getText({ $, query = '', splitCharacter = '', cb = undefined }) {
    const temp = $(query);
    if(temp.length) {
      let tempHandled = temp.text().trim();
      if(splitCharacter) {
        tempHandled = tempHandled.split(splitCharacter);
      }
      if (typeof cb === 'function') {
        return cb(tempHandled);
      }else {
        return tempHandled;
      }
    }else {
      return undefined;
    }
  }

  // [get list images of every one chapter]
  async getImagesChapter({ linkChapter, query, protocol = 'http' }) {
    return new Promise(async (resovle, reject) => {
      try {
        const res = await axios.get(linkChapter);
        if (res.status === 200) {
          const dom = htmlparser2.parseDocument(res.data);
          const $ = cheerio.load(dom);
          resovle(
            $(query)
              .map((index, element) => {
                const link = $(element).attr("src");
                return checkProtocol({ URLWebManga: link }) ? link : `${protocol}:${link}`;
              })
              .toArray()
          );
        } else {
          reject(
            new Error(
              "[Miru request] link chapter is error status code: " + res.status
            )
          );
        }
      } catch (error) {
        reject(new Error("[Miru error] => " + error));
      }
    });
  }

}

class blogtruyen extends commonStatement {

  constructor() {
    super();
  }

  // [get information about manga, author, team-translate,...etc..]
  getInfo({ $ }) {
    const info = $(".main-content .description p")
      .map((index, element) => {
        const temp = $(element).text();
        if (temp.includes("Tác giả:")) {
          return {
            author: temp
              .split(":")[1]
              .split(/\s\s+/g)
              .filter((value) => value !== ""),
          };
        } else if (temp.includes("Tên khác:")) {
          return {
            nameOther: temp
              .split(":")[1]
              .split(/\s\s+/g)
              .filter((value) => value !== ""),
          };
        } else if (temp.includes("Nguồn:")) {
          return {
            source: temp
              .split(":")[1]
              .split(/\s\s+/g)
              .filter((value) => value !== ""),
          };
        } else if (temp.includes("Nhóm dịch:")) {
          return {
            teamTranslate: temp
              .split(":")[1]
              .split(/\s\s+/g)
              .filter((value) => value !== ""),
          };
        } else if (temp.includes("Thể loại:")) {
          return {
            genres: temp
              .split(":")[1]
              .split(/\s\s+/g)
              .filter((value) => value !== ""),
          };
        } else if (temp.includes("Đăng bởi:")) {
          const origin = temp.split(":");
          return {
            origin: {
              postBy: String(origin[1]).split("Trạng thái")[0].trim(),
              status: String(origin[2]).trim(),
            },
          };
        }
      })
      .toArray();

    return info.reduce((previousValue, currentValue) => {
      return { ...previousValue, ...currentValue };
    }, {});
  }
  // [get decription about manga]
  getDesc({ $ }) {
    let descTemp = $(".main-content .detail .content")
      .clone()
      .children()
      .remove()
      .end()
      .text()
      .trim()
      .replace(/\s\s+/g, " ");
    return descTemp !== ""
      ? descTemp
      : $(".main-content .detail .content")
          .text()
          .trim()
          .replace(/\s\s+/g, " ");
  }

  // [get list chapters of manga clone]
  getChapters({ $ }) {
    return $("#list-chapters p")
      .map((index, element) => {
        const tempInfo = $(element).find("span.title > a");
        const URLChapter = tempInfo.attr("href");
        const tempDateFormated = formatDate(
          $(element).find("span.publishedDate").text().trim()
        );
        return {
          name: tempInfo.text(),
          link: checkProtocol({ URLWebManga: URLChapter })
            ? URLChapter
            : completeDNS({
                protocol: "https",
                domain: "blogtruyen",
                TLD: "vn",
                urlPoint: URLChapter,
              }),
          create: {
            date: tempDateFormated.date,
            hour: tempDateFormated.hour,
          },
        };
      })
      .toArray()
      .reverse();
  }

  // [general of manga clone]
  async getGeneral({ $ }) {
    let general = new Object();
    let tempPromise = new Array();
    general.type = 'blogtruyen';
    general.name = $(".main-content h1.entry-title").text().trim();
    general.thumbnail = $(".main-content .thumbnail > img").attr("src");
    general.info = this.getInfo({ $ });
    general.desc = this.getDesc({ $ });
    general.create_date = $(
      ".main-content .description .row > .col-sm-6 > span"
    )
      .text()
      .trim();
    general.chapters = this.getChapters({ $ });
    tempPromise = general.chapters.map(async (element, index) => {
      return {
        ...element,
        images: await this.getImagesChapter({ linkChapter: element.link, query: '#content > img', protocol: 'https' }),
      };
    });
    general.chapters = await Promise.all(tempPromise);
    return general;
  }
}

class nettruyenco extends commonStatement {
  // [general of manga clone]
  constructor() {
    super();
  }

  getChapters({ $, query, cb = undefined }) {

    return $(query).map((index, element) => {
      const tempChapter = $(element).find('.chapter > a');
      return {
        name: tempChapter.text().trim(),
        link: tempChapter.attr('href'),
        updated_date: $(element).find('div.col-xs-4.text-center').text().trim(),
      }
    }).toArray().reverse();

  }

  async getGeneral({ $ }) {
    let tempPromise = new Array();
    let general = new Object();
    let tempNameOther = this.getText({ $, query: '#item-detail > .detail-info .col-info > .list-info > .othername > .col-xs-8', splitCharacter: ';', cb: (tempString) => tempString.map(value => value.trim()) });
    let tempAuthor = this.getText({ $, query: '#item-detail > .detail-info .col-info > .list-info > .author > .col-xs-8', splitCharacter: '-', cb: (tempString) => tempString.map(value => value.trim()) });
    let tempGenres = this.getText({ $, query: '#item-detail > .detail-info .col-info > .list-info > .kind > .col-xs-8', splitCharacter: '-', cb: (tempString) => tempString.map(value => value.trim()) });
    let tempStatus = this.getText({ $, query: '#item-detail > .detail-info .col-info > .list-info > .status > .col-xs-8' });
    let tempThumbnail = $("#item-detail > .detail-info .col-image > img").attr("src");
    let tempChapters = this.getChapters({ $, query: '#nt_listchapter > nav > ul > li' });
    general.type = 'nettruyenco';
    general.name = $("#item-detail > h1.title-detail").text().trim();
    general.desc = $("#item-detail > .detail-content p").text().trim();
    if(!checkProtocol({ URLWebManga: tempThumbnail })) general.thumbnail = completeDNS({ protocol: 'http', urlPoint: tempThumbnail, slug: false });
    if(tempNameOther !== undefined) general.nameOther = tempNameOther;
    if(tempAuthor !== undefined) general.nameAuthor = tempAuthor;
    if(tempStatus !== undefined) general.status = tempStatus;
    if(tempGenres !== undefined) general.genres = tempGenres;
    general.chapters = tempChapters.length ? tempChapters : [];
    general.updated_date = formatDate($("#item-detail > time.small").text().trim().slice(1, -1).split(/^[C|c]ập nhật lúc:/g)[1].trim(), true);

    tempPromise = general.chapters.map(async (element, index) => {
      return {
        ...element,
        images: await this.getImagesChapter({ linkChapter: element.link, query: '#ctl00_divCenter .page-chapter > img' }),
      };
    });
    general.chapters = await Promise.all(tempPromise);
    return general;
  }
}

module.exports = {
  blogtruyen: new blogtruyen(),
  nettruyenco: new nettruyenco(),
};
