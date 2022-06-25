function checkProtocol({ URLWebManga = "" }) {
  if (URLWebManga !== "") {
    return new RegExp("^https?", "g").test(URLWebManga);
  } else {
    return new Error("URLWebManga not pass to funtion!");
  }
}

function completeDNS({
  protocol = "http",
  subdomain = "",
  domain = "",
  TLD = "vn",
  urlPoint,
  slug = true
}) {
  return `${protocol}:${slug ? '//' : ''}${
    subdomain ? subdomain + '.' : ''
  }${domain ? domain + '.' : ''}${domain ? TLD : ''}${urlPoint}`;
}

function formatDate(template = "", reverse) {
  const tempDate = template.split(' ');
  return {
    date: reverse ? tempDate[1] : tempDate[0],
    hour: reverse ? tempDate[0] : tempDate[1],
  };
}

function analysisDNS({ dns = '' }) {
  try {
    if(dns) {
      if(!checkProtocol({ URLWebManga: dns })) {
        return new Error(
          `Link manga must be have protocol (O_O)~`
        );
      }else {
        let temp = String(dns).split(/^https?:\/\//g)[1];
        if (temp.includes("/")) {
          let tempDomain = temp.split("/");
          temp = tempDomain[0].split(".");
          if (temp.length > 2) {
            // have subdomain
            let dns = temp.slice(-2);
            let subdomain = temp.slice(0, -2);
            return {
              dns: {
                TLD: dns[1],
                domainName: dns[0],
                subDomain: subdomain,
                path: tempDomain.slice(1).join('/'),
              },
            };
          } else {
            // just domain
            return {
              dns: {
                TLD: temp[1],
                domainName: temp[0],
                path: tempDomain.slice(1).join('/'),
              },
            };
          }
        } else {
          return new Error(
            `This is just homepage? You must insert link manga (●'◡'●)~`
          );
        }
      }
    }else {
      return new Error(
        `You must insert link manga (O_O)~`
      );
    }
  } catch (error) {
    return new Error('Link invalid by error !' + error);
  }
}

module.exports = {
  formatDate,
  completeDNS,
  analysisDNS,
  checkProtocol,
};
