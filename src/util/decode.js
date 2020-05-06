import { BarcodeFormat, DecodeHintType, BrowserMultiFormatReader, BinaryBitmap, RGBLuminanceSource, HybridBinarizer } from '@zxing/library'
import Jimp from 'jimp'

export default async function(url) {
	return new Promise((resolve, reject) => {
		// 配置图片url
		const webImgUrl = url

		// 配置barcode识别准备
		const hints = new Map()
		const formats = [BarcodeFormat.CODE128]
		hints.set(DecodeHintType.characterSet, 'utf-8')
		hints.set(DecodeHintType.POSSIBLE_FORMATS, formats)
		hints.set(DecodeHintType.TRY_HARDER, true)
		const codeReader = new BrowserMultiFormatReader(hints)
		// 开始读取图片
		Jimp.read(webImgUrl)
			.then((webImg) => {
				// 读取完图片后开始处理图片
				var did = []
				// 将图片旋转4次进行barcode读取
				for (let index = 0; index < 4; index++) {
					// 尝试识别一个方向的barcode
					webImg.rotate(90)
					const len = webImg.bitmap.width * webImg.bitmap.height
					const luminancesUint8Array = new Uint8Array(len)
					for (let i = 0; i < len; i++) {
						luminancesUint8Array[i] = ((webImg.bitmap.data[i * 4] + webImg.bitmap.data[i * 4 + 1] * 2 + webImg.bitmap.data[
							i *
							4 + 2]) / 4) & 0xFF
					}
					const luminanceSource = new RGBLuminanceSource(luminancesUint8Array, webImg.bitmap.width, 30)
					const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource.invert()))
					const decoded = codeReader.decodeBitmap(binaryBitmap)
					did.push(decoded.text)
				}
				// 结束4次识别，检查是否识别到4段码，并将码排序
				if (did.length == 4) {
					var result = []
					var did_index = 0
					for (var i = 0; i < 4; i++) {
						if (did[i].indexOf('did:') == 0) {
							did_index = i
							break
						}
					}
					result.push(...did.slice(did_index, did.length))
					result.push(...did.slice(0, did_index))
					console.log(result)
					did = result.join('')
				} else {
					reject('解析失败')
				}
				resolve(did)
			}).catch(e => {
				console.log(e)
				reject('解析头像失败')
			})
	})
}
