const { fileUpload } = require("./service");

exports.fileUploadController = async(req,res)=>{
    try {
        let result = await fileUpload(req)
        res.status(200).json(result)
    } catch (error) {
        console.log("fdfd",error)
        res.status(500).json(error)
    }
}