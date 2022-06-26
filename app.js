const axios = require('axios');
const cheerio = require('cheerio');
const htmlparser2 = require('htmlparser2');

const contextWebManga = require('./util/index.js');
const { analysisDNS } = require('./util/helper.js');
const { websiteSupport } = require('./config/index.js');

const linkManga = 'http://www.nettruyenco.com/truyen-tranh/toi-viet-sach-de-thang-cap-354910';

(async () => {
  try {
    
    const { dns } = analysisDNS({ dns: linkManga }); // analysis url to dns information details
    const webMatch = websiteSupport.find(value => value.siteName === dns.domainName); // check website list support to clone
    if(webMatch) {
      const res = await axios.get(linkManga);
      if(res.status === 200) {
        const dom = htmlparser2.parseDocument(res.data);
        const $ = cheerio.load(dom);
        let general = new Object();
        general = await contextWebManga[webMatch.siteName].getGeneral({ $ });
        console.log(general);
      }
    }else {
      throw new Error(`Website clone is "${dns?.subDomain ? (dns.subDomain.join('.') + '.') : ''}${dns.domainName}.${dns.TLD}" not support ╰(*°▽°*)╯`);
    }
    
  } catch (error) {
    console.log(error);
  }

})()
