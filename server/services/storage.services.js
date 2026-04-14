const { ImageKit } = require('@imagekit/nodejs');

const imagekitClient = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function uploadFile(file, fileName, folder) {
    console.log("Uploading file to ImageKit:", { fileName, folder });
    const result = await imagekitClient.files.upload({
        file: file,
        fileName: fileName + '-' + Date.now(),
        folder: folder,
    });
    // console.log("ImageKit upload result:", result);
    return result.url;
};


module.exports = {
    uploadFile,
};