import JsBarcode from 'jsbarcode'
import Jimp from 'jimp'

const colorThief = new ColorThief()
const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
	const hex = x.toString(16)
	return hex.length === 1 ? '0' + hex : hex
}).join('')

const getColors = (img) => {
	const otherColors = colorThief.getPalette(img).slice(0, 9).map(v => rgbToHex(...v))
	const mainColor = rgbToHex(...colorThief.getColor(img))
	const colorList = [mainColor, ...otherColors]
	return colorList
}

/** 该方法用来绘制一个有填充色的圆角矩形
 *@param cxt:canvas的上下文环境
 *@param x:左上角x轴坐标
 *@param y:左上角y轴坐标
 *@param width:矩形的宽度
 *@param height:矩形的高度
 *@param radius:圆的半径
 *@param fillColor:填充颜色
 **/
export function fillRoundRect(cxt, x, y, width, height, radius, fillColor) {
	// 圆的直径必然要小于矩形的宽高
	if (2 * radius > width || 2 * radius > height) return false

	cxt.save()
	cxt.translate(x, y)
	// 绘制圆角矩形的各个边
	drawRoundRectPath(cxt, width, height, radius)
	cxt.fillStyle = fillColor || '#000' // 若是给定了值就用给定的值否则给予默认值
	cxt.fill()
	cxt.restore()
}


/** 该方法用来绘制圆角矩形
 *@param cxt:canvas的上下文环境
 *@param x:左上角x轴坐标
 *@param y:左上角y轴坐标
 *@param width:矩形的宽度
 *@param height:矩形的高度
 *@param radius:圆的半径
 *@param lineWidth:线条粗细
 *@param strokeColor:线条颜色
 **/
export function strokeRoundRect(cxt, x, y, width, height, radius, lineWidth, strokeColor) {
	// 圆的直径必然要小于矩形的宽高
	if (2 * radius > width || 2 * radius > height) return false

	cxt.save()
	cxt.translate(x, y)
	// 绘制圆角矩形的各个边
	drawRoundRectPath(cxt, width, height, radius)
	cxt.lineWidth = lineWidth || 2 // 若是给定了值就用给定的值否则给予默认值2
	cxt.strokeStyle = strokeColor || '#000'
	cxt.stroke()
	cxt.restore()
}

function drawRoundRectPath(cxt, width, height, radius) {
	cxt.beginPath(0)
	// 从右下角顺时针绘制，弧度从0到1/2PI
	cxt.arc(width - radius, height - radius, radius, 0, Math.PI / 2)

	// 矩形下边线
	cxt.lineTo(radius, height)

	// 左下角圆弧，弧度从1/2PI到PI
	cxt.arc(radius, height - radius, radius, Math.PI / 2, Math.PI)

	// 矩形左边线
	cxt.lineTo(0, radius)

	// 左上角圆弧，弧度从PI到3/2PI
	cxt.arc(radius, radius, radius, Math.PI, Math.PI * 3 / 2)

	// 上边线
	cxt.lineTo(width - radius, 0)

	// 右上角圆弧
	cxt.arc(width - radius, radius, radius, Math.PI * 3 / 2, Math.PI * 2)

	// 右边线
	cxt.lineTo(width, height - radius)
	cxt.closePath()
}

function generateAvatar(resolve, reject, avatar, bgColor, symbol, did) {
	let isSpecial = symbol.toLowerCase().search(/(wuhan|china)/i) > -1
	if (isSpecial) {
		bgColor = '#ef0505'
	}
	const codeCanvas = document.createElement('canvas')
	const codeCtx = codeCanvas.getContext('2d')
	const imgcodes = []
	// 为barcode 设置数据和样式
	for (let i = 0; i < 4; i++) {
		const didPart = did.slice(i * 12, (i + 1) * 12)
		JsBarcode(codeCanvas, didPart, {
			lineColor: '#FFF',
			width: 2.5,
			height: 8,
			background: bgColor,
			displayValue: false,
			margin: 7
		})

		const imgcode = Jimp.read(codeCanvas.toDataURL('image/jpeg', 1.0))
		imgcodes.push(imgcode)
		codeCtx.clearRect(0, 0, 640, 640)
	}

	// 创建图片背景色，用来作为边框
	let cvs = document.createElement('canvas')
	let ctx = cvs.getContext('2d')
	cvs.width = 640
	cvs.height = 640
	ctx.fillStyle = bgColor // 如需修改边框颜色改此值
	ctx.fillRect(0, 0, 640, 640)
	const bkg = cvs.toDataURL('image/jpeg', 1.0)
	const img1 = Jimp.read(bkg) // 将背景色生成图，读取到jimp里

	// 创建logo背景色
	ctx.clearRect(0, 0, 640, 640)
	ctx.beginPath()
	ctx.arc(100, 100, 76, 0 * Math.PI, 2 * Math.PI, true)
	ctx.fillStyle = bgColor // 填充颜色
	ctx.fill() // 画实心圆
	ctx.closePath()
	const bkg2 = cvs.toDataURL('image/png')
	const logobkg = Jimp.read(bkg2) // 生成logo背景色，读取到jimp里
	const logo = Jimp.read(symbol)

	// 创建遮罩层
	ctx.clearRect(0, 0, 640, 640)
	cvs.width = 600
	cvs.height = 600
	fillRoundRect(ctx, 0, 0, 600, 600, 30, '#fff')
	const maskBg = cvs.toDataURL('image/png', 1.0)

	const img2 = Jimp.read(avatar) // 读取原头像
	const mask = Jimp.read(maskBg)

	Promise.all([img1, img2, mask, ...imgcodes, logobkg, logo]).then(images => {
		let targetImg = images[0]
		let srcImg = images[1]
		let maskImg = images[2]
		let codeImg1 = images[3]
		let codeImg2 = images[4]
		let codeImg3 = images[5]
		let codeImg4 = images[6]
		let logobkgImg = images[7]
		let logoImg = images[8]

		codeImg1.rotate(180) // 第一部分旋转180度
		codeImg2.rotate(-90) // 第二部分旋转-90度
		codeImg4.rotate(90) // 再旋转180度，复原

		targetImg.blit(codeImg1, 40, 640 - 24)
		targetImg.blit(codeImg2, 0, 40)
		targetImg.blit(codeImg3, 40, 2)
		targetImg.blit(codeImg4, 640 - 24, 40)

		srcImg.resize(640 - 40, 640 - 40)
		srcImg.mask(maskImg) // 画上原图背景，并填充遮罩
		// logoImg.circle()
		targetImg.blit(srcImg, 20, 20)
		let logoBgPos = 172
		let logoPos = 92
		let posX = 20,
			posY = 471
		if (!isSpecial) {
			logoImg.resize(112, 112)
			targetImg.blit(logobkgImg, 640 - logoBgPos, 640 - logoBgPos) // 画上logo背景
			posX = 640 - (logoPos + (logoBgPos - logoPos) / 2)
			posY = 640 - (logoPos + (logoBgPos - logoPos) / 2)
		} else {
			logoImg.resize(600, 129)
		}
		targetImg.blit(logoImg, posX, posY) // 640为图片大小，192为logo背景大小，112为logo大小
			.getBase64(Jimp.AUTO, (err, src) => {
				if (err) return reject(err)
				resolve(src)
			})

	})
}
export default (avatar, bgColor, symbol, did) => {
	return new Promise((resolve, reject) => {
		generateAvatar(resolve, reject, avatar, bgColor, symbol, did)
	})
}

export const pickColor = (node) => {
	return new Promise(resolve => {
		const img = document.querySelector(node)

		// 提取背景主题色
		if (img.complete) {
			const colorList = getColors(img)
			resolve({ avatar: img.src, colorList })
		} else {
			img.addEventListener('load', () => {
				const colorList = getColors(img)
				resolve({ avatar: img.src, colorList })
			})
		}
	})
}
