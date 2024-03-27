const path = require("path");
const fs = require("fs");
const resizeImg = require("resize-img")
const sharp = require("sharp")
let filePath = path.join(__dirname, "uploadedFiles", "09376183431", "test4.png");
let extension = filePath.split(".").pop();
console.log(extension)
let fileStat = fs.statSync(filePath);
console.log(filePath)
console.log(fileStat.size / 1024);
sharp(fs.readFileSync(filePath))
    .resize(300, 300)
    .toBuffer()
    .then((data) => {
        console.log(data.byteLength / 1024);
        console.log(data.toString("base64"));
        fs.writeFileSync(path.join(__dirname, "uploadedFiles", "09376183431", "test4-300.png"), data);
        let filePath1 = path.join(__dirname, "uploadedFiles", "09376183431", "test4-300.png");
        let fileStat1 = fs.statSync(filePath1);
        console.log(filePath1)
        console.log(fileStat1.size / 1024);
    });

// module.exports.resizeImage = function resizeImage(userPhone,inputImagePath) {
//     let filePath = path.join(__dirname, "uploadedFiles", userPhone.toString(), inputImagePath);
//     let inputImageExtension = filePath.split(".").pop();
//     sharp(fs.readdirSync(filePath)).resize(300, 300).toBuffer()
//         .then((data) => {
//             fs.writeFileSync(path.join(__dirname, "uploadedFiles", "09376183431", "test4-300.png"), data);
//         })
//         .catch((err) => {
        
//     })
// }
// (async () => {
//     let img = await resizeImg(fs.readFileSync(filePath), { width: 200, height: 200 });
//     fs.writeFileSync(path.join(__dirname, "uploadedFiles", "09376183431", "test3-32-32.jpg"), img);
//     let filePath1 = path.join(__dirname, "uploadedFiles", "09376183431", "test3-32-32.jpg");
//     let fileStat1 = fs.statSync(filePath1);
//     console.log(filePath1)
//     console.log(fileStat1.size / 1024);
// })()


