import axios from './axios'

const apiChainAuth = '/api/v1/mainnet/auth'
const apiChainBind = '/api/v1/mainnet/bind'
const apiChainSn = '/api/v1/mainnet/bind_sn'
const apiWxSignature = '/api/v1/read_task/wx_signature'
const apiAccessToken = '/api/v1/mainnet/wechat_user_info'
const apiAvatarStyle = '/api/v1/mainnet/avatar_style'
const apiEncodeAvatar = '/api/v1/mainnet/encode_avatar'
const apiDecodeAvatar = '/api/v1/mainnet/decode_avatar'
const apiUpdateAvatar = '/api/v1/mainnet/update_avatar'
const apiUploadImg = '/api/v1/mainnet/upload_avatar'
const apiGifts = '/api/v1/lottery/gifts'
const apiDraw = '/api/v1/lottery/draw'
const apiLotteryRecord = '/api/v1/lottery/records'
const apiBuildTeam = '/api/v1/mainnet/build_team'
const apiGroupLogo = '/api/v1/mainnet/get_team_logo'
const apiTeamInfo = '/api/v1/mainnet/team_info'
const apiGetMembers = 'https://dana.prabox.net/api/v1/did/members'
const apiGetTransactions = 'https://dana.prabox.net/api/v1/transfer'
const apiTeamTags = '/api/v1/mainnet/get_team_tags'
const apiSymbolPic = '/api/v1/mainnet/get_team_logo_by_symbol'
const apiBalance = '/api/v1/lottery/balance'
const apiInviteRank = '/api/v1/mainnet/invite_report'
const apiRemoveBind = 'api/v1/mainnet/remove_bind'

const mockData = {
	'country': '中国',
	'unionid': 'oJG9ntjq-vDyMlDZPGC2ESNbwTFghwj',
	'province': '北京',
	'city': '朝阳',
	'openid': 'ohHyijtT_tpX1Nv7xbNUswDu9Me8',
	'sex': 1,
	'nickname': '青',
	'headimgurl': 'http://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83epcKdUcX0VeDqlKLRCDDLzylKEJ0PdKiblfdCdkkK6U9jFv8qmTGsm3AhsOsT4tZ0nOibRlrf9aF72A/132',
	'language': 'zh_CN',
	'privilege': [],
	'wxid': 'wxid_6h9318ajy4wc22',
	'token': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ3eGlkX2dycmlkb2VrZXM4ZTIyIiwiYXV0aCI6Ik1BSU5ORVRfVVNFUiIsImV4cCI6MTU4NjkxNjMwMn0.RJhvO3HXHWyzNRaPoxZaBE--W8_m2sAizjTLeUzt-dDN3z5OBPkgybvxYs8KosNxumfF0r-8PZnJLQ2jyw00-g'
}

export async function chainAuth(wxcode) {
	if (process.env.VUE_APP_TEST_WX) {
		return {
			data: {
				wxid: process.env.VUE_APP_TEST_WX,
				token: '123456789'
			}
		}
	}
	return axios.get(apiChainAuth, {
		params: {
			wxcode
		}
	})
}

export async function chainBindSn(wxcode) {
	return axios.get(apiChainSn, {
		params: {
			wxcode
		}
	})
}

export async function getWxSignature(url) {
	return axios.get(apiWxSignature, {
		params: {
			url
		}
	})
}

export async function chainBind(sn, wxid) {
	return axios.post(apiChainBind, {
		sn,
		wxid
	})
}

export async function getWechatUser(wxcode) {
	if (process.env.VUE_APP_TEST_WX) {
		return {
			data: mockData
		}
	}
	return axios.get(apiAccessToken, {
		params: {
			wxcode
		}
	})
}

export async function getAvatarStyle(avatar) {
	return axios.get(apiAvatarStyle, {
		params: {
			avatar
		}
	})
}

export async function encodeAvatar(avatar, bgcolor, did, teamName) {
	return axios({
		method: 'get',
		url: apiEncodeAvatar,
		responseType: 'arraybuffer',
		params: {
			avatar,
			bgcolor,
			did,
			team_name: teamName
		}
	})
}

export async function decodeAvatar(avatar) {
	return axios.get(apiDecodeAvatar, {
		params: {
			avatar
		}
	})
}

export async function updateAvatar(wxid, avatar) {
	return axios.get(apiUpdateAvatar, {
		params: {
			avatar,
			wxid
		}
	})
}

export async function uploadImg(data) {
	return axios.post(apiUploadImg, data, {
		headers: { 'Content-Type': 'multipart/form-data' }
	})
}

export async function drawLottery(token) {
	return axios.get(apiDraw, {
		params: {
			token
		}
	})
}

export async function getGift() {
	return axios.get(apiGifts)
}

export async function getLotteryRecord(did) {
	return axios.get(apiLotteryRecord, {
		params: {
			did
		}
	})
}

export async function buildTeam({ did, name, symbol, admin_qrcode, group_qrcode_list, description, url, website, tags }) {
	let qrcodeList = group_qrcode_list
	if (!Array.isArray(group_qrcode_list) && group_qrcode_list) qrcodeList = group_qrcode_list.replace(/\s+/g, '').split(',')
	return axios.post(apiBuildTeam, {
		did,
		name,
		symbol,
		admin_qrcode,
		group_qrcode_list: qrcodeList,
		description,
		url,
		website,
		tags
	})
}

export async function getTeamLogo(did) {
	return axios.get(apiGroupLogo, {
		params: {
			superior_did: did
		}
	})
}

export async function getMembers(didHash, page = 1, size = 12) {
	return axios.get(`${apiGetMembers}/${didHash}?page[number]=${page}&page[size]=${size}`)
}

export async function getTeamInfo(did) {
	return axios.get(apiTeamInfo, {
		params: {
			did
		}
	})
}

export async function getTransaction(did, page = 1, size = 10) {
	return axios.get(`${apiGetTransactions}/${did}?page[number]=${page}&page[size]=${size}`)
}

export async function getTeamTags() {
	return axios.get(apiTeamTags)
}

export async function getPicBySymbol(symbol) {
	return axios.get(apiSymbolPic, {
		params: {
			symbol
		}
	})
}

export async function getLotteryBalance() {
	return axios.get(apiBalance)
}

export async function getInviteRank() {
	return axios.get(apiInviteRank)
}

export async function removeBind(token) {
	return axios.get(apiRemoveBind, {
		params: {
			token
		}
	})
}
