// CORS enabled lambda proxy response
module.exports =  (res, status) => {
  return {
    statusCode: status || 200,
    headers: {
      "Access-Control-Allow-Origin" : "*"
    },
    body: JSON.stringify(res)
  }
};
