<template>
	<div class="team-update-component">
		<div class="team-update">
			<ValidationObserver v-slot="{ invalid }" ref="form">
				<van-cell-group title="* 团队全称" :border="false">
					<ValidationProvider v-slot="{ errors }" rules="required" name="name">
						<van-field v-if="pageType !== 'create'" v-model="teamInfo.name" disabled />
						<van-field v-else v-model="didForm.name" :error-message="errors[0]" placeholder="请输入团队名称" />
					</ValidationProvider>
				</van-cell-group>
				<van-cell-group title="* 团队简称" :border="false">
					<ValidationProvider v-slot="{ errors }" rules="required|max:5" name="symbol">
						<van-field v-model="didForm.symbol" :error-message="errors[0]" placeholder="如BTC、PRM或者“般若”、“波卡”" @input="debouncedSearch" />
					</ValidationProvider>
				</van-cell-group>
				<van-cell-group title="* 团队LOGO" :border="false">
					<ValidationProvider v-slot="{ errors }" rules="required" name="url" class="hidden">
						<van-field v-model="didForm.url" :error-message="errors[0]" placeholder="请选择团队logo" />
					</ValidationProvider>
				</van-cell-group>
				<van-image v-if="symbolPic" :src="symbolPic" width="1rem" height="1rem" round>
					<template v-slot:loading>
						<van-loading type="spinner" size="20" />
					</template>
				</van-image>
				<van-uploader v-else class="upload" v-model="teamLogo" :before-read="beforeUpload" :after-read="teamLogoUploaded"
				 @delete="teamLogoDeleted" :max-count="1" />
				<van-cell-group title="* 团队管理联系方式(方便推荐人直接联系进入社群)" :border="false">
					<ValidationProvider v-slot="{ errors }" rules="required" name="admin_qrcode" class="hidden">
						<van-field v-model="didForm.admin_qrcode" :error-message="errors[0]" placeholder="团队管理员微信二维码，方便推荐人直接联系进入社群" />
					</ValidationProvider>
				</van-cell-group>
				<van-uploader class="upload" v-model="adminQrcode" :before-read="beforeUpload" :after-read="adminUploaded" @delete="deleteAdmin"
				 :max-count="1" />
				<van-cell-group title="* 团队社群二维码(方便推荐人直接扫码进群)" :border="false">
					<ValidationProvider v-slot="{ errors }" rules="qrcode" name="group_qrcode_list" class="hidden">
						<van-field v-model="didForm.group_qrcode_list" :error-message="errors[0]" placeholder="请输入进群二维码(多个以逗号分割)" />
					</ValidationProvider>
				</van-cell-group>
				<van-uploader class="upload" v-model="fileList" :before-read="beforeUpload" :after-read="uploaded" :max-count="3"
				 @delete="handleDelete" multiple />
				<van-cell-group v-if="pageType !== 'create'" title="描述信息" :border="false">
					<ValidationProvider v-slot="{ errors }" name="description">
						<van-field v-model="didForm.description" :error-message="errors[0]" placeholder="请输入描述" />
					</ValidationProvider>
				</van-cell-group>
				<van-cell-group v-if="pageType !== 'create'" title="团队网址" :border="false">
					<ValidationProvider v-slot="{ errors }" name="website">
						<van-field v-model="didForm.website" :error-message="errors[0]" placeholder="请输入团队网址" />
					</ValidationProvider>
				</van-cell-group>
				<van-cell-group title="团队标签" :border="false">
					<van-cell is-link :to="{path: '/team/tags', query: {...$route.query}}" title-class="tag-title">
						<div v-if="didForm.tags.length > 0" slot="title">
							<span v-for="item in didForm.tags">
								{{ item }}
							</span>
						</div>
						<span v-else slot="title">请选择标签</span>
					</van-cell>
				</van-cell-group>
				<p class="tips" v-if="walletInfo.did !== owner">
					注：所有*标的均为必填选项
				</p>
				<van-button type="primary" square class="btn-submit" size="large" :disabled="invalid || fileList.length === 0"
				 @click="handleSubmit">{{ btnText }}</van-button>
			</ValidationObserver>
		</div>
	</div>
</template>
<script>
	import { mapState, mapActions } from 'vuex'
	import { ValidationObserver, ValidationProvider } from 'vee-validate'
	import { SET_TEAM_INFO, DISPATCH_SIGN } from '@/vuex/constants'
	import { getPicBySymbol, buildTeam, uploadImg } from '@/util/api'
	import { debounce } from '@/util/common'
	const intialFormData = {
		name: '',
		symbol: '',
		admin_qrcode: '',
		group_qrcode_list: [],
		url: '',
		website: '',
		description: '',
		tags: [],
	}
	export default {
		name: 'teamUpdate',
		data() {
			return {
				pageType: '',
				didForm: Object.assign({}, intialFormData),
				btnText: '更新团队',
				symbolPic: '',
				fileList: [],
				adminQrcode: [],
				teamLogo: []
			}
		},
		computed: {
			...mapState([
				'walletInfo',
				'teamInfo'
			])
		},
		components: {
			ValidationProvider,
			ValidationObserver
		},
		created() {
			this.debouncedSearch = debounce(this.handleInputChange)
			const { type } = this.$route.query
			if (type === 'create') {
				this.btnText = '创建团队'
			} else {
				this.didForm = {
					...intialFormData,
					...this.teamInfo
				}
				this.handleInputChange(this.didForm.symbol)
			}
			this.pageType = type
			if (this.didForm.group_qrcode_list) {
				this.fileList = this.didForm.group_qrcode_list.map(v => {
					return {
						url: v
					}
				})
			} else {
				this.didForm.group_qrcode_list = []
			}

			if (this.didForm.admin_qrcode) {
				this.adminQrcode = [{
					url: this.didForm.admin_qrcode
				}]
			}
		},
		activated() {
			const tags = sessionStorage.getItem('tags')
			if (tags) {
				this.didForm.tags = JSON.parse(tags)
			}
		},
		methods: {
			async handleSubmit() {
				// register name to chain
				if (this.pageType === 'create') {
					// const data = {
					// 	address: this.walletInfo.address,
					// 	method: 'setGroupName',
					// 	params: [this.didForm.name]
					// }
					// this[DISPATCH_SIGN](data)
				} else {
					this.didForm.name = this.teamInfo.name
				}
				const rs = await buildTeam({
					...this.didForm,
					did: this.walletInfo.did
				})
				if (rs.hasErrors) {
					return this.$toast.error(rs.message)
				}

				// update team info
				const teamInfo = {
					...this.teamInfo,
					...this.didForm
				}

				this[SET_TEAM_INFO](teamInfo)

				this.$router.go(-1)
			},
			async handleInputChange(symbol) {
				const { data } = await getPicBySymbol(symbol)
				this.symbolPic = data && data.url
				this.$set(this.didForm, 'url', this.symbolPic)
			},
			beforeUpload(file) {
				const maxFileSize = 1024 * 1024 * 10;
				// if (!/\.(gif|jpg|jpeg|png|GIF|JPG|JPEG|PNG)$/.test(file.name)) {
				// 	this.$toast('图片类型必须是gif,jpeg,jpg,png中的一种')
				// 	return false
				// }
				if (file.size > maxFileSize) {
					this.$toast('图片尺寸超过10M了')
					return false
				}
				return true
			},
			async uploaded(res) {
				try {
					const data = new FormData()
					data.append('file', res.file)
					const rs = await uploadImg(data)
					const pic = `https://static.chain.pro/${rs.data}`
					this.didForm.group_qrcode_list.push(pic)
					const len = this.fileList.length
					this.$set(this.fileList, len - 1, { url: pic })
				} catch (e) {
					alert(e)
				}
			},
			handleDelete(_res, { index }) {
				console.log(_res, 'res')
				this.didForm.group_qrcode_list.splice(index, 1)
			},
			deleteAdmin() {
				this.didForm.admin_qrcode = ''
			},
			async adminUploaded(res) {
				try {
					console.log(res, 'file---')
					const data = new FormData()
					data.append('file', res.file)
					const rs = await uploadImg(data)
					const pic = `https://static.chain.pro/${rs.data}`
					console.log(pic, 'admin pic----')
					this.didForm.admin_qrcode = pic
					this.adminQrcode = [{
						url: pic
					}]
				} catch (e) {
					alert(e)
				}
			},
			teamLogoDeleted() {
				this.didForm.url = ''
			},
			async teamLogoUploaded(res) {
				try {
					const data = new FormData()
					data.append('file', res.file)
					const rs = await uploadImg(data)
					const pic = `https://static.chain.pro/${rs.data}`
					console.log(pic, 'admin pic----')
					this.didForm.url = pic
					this.teamLogo = [{
						url: pic
					}]
				} catch (e) {
					alert(e)
				}
			},
			...mapActions([
				SET_TEAM_INFO,
				DISPATCH_SIGN
			])
		}
	}
</script>
<style lang="scss">
	@import '../../assets/css/variables.scss';

	.team-update-component {
		.tag-title {
			color: #969799;
		}

		.van-image {
			background-color: #c1bdbd;
			margin: $mediumGutter 0 0 16PX;

			img {
				transform: scale(0.8);
			}
		}

		.upload {
			padding: $smallGutter 16PX 0;

			img {
				transform: scale(1);
			}

			.van-image {
				margin: 0;
			}
		}
	}
</style>
