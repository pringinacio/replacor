

//function getPageUpdateQuery(pageId) {
//  return domain + "/wiki/rest/api/content/" + pageId;
//}
//

//function updateContent(id, version, type, title, content) {
//  const bodyData = `{
//        "version": {
//            "number": ${version}
//        },
//        "type": "${type}",
//        "title":  "${title}",
//        "body": {
//            "storage": {
//                "value": ${content},
//                "representation": "storage"
//            }
//        }
//    }`;
//  logger.debug(bodyData.toString());
//  fetch(getPageUpdateQuery(id), {
//    method: "PUT",
//    headers: header,
//    body: bodyData,
//  })
//    .then((res) => res.json())
//    .then((json) => {
//      json.data
//        ? console.log(json.data.errors)
//        : console.table({
//            id: json.id,
//            type: json.type,
//            version: json.version.number,
//            title: json.title,
//          });
//    })
//    .catch((err) => {
//      console.error(err);
//    });
//}
