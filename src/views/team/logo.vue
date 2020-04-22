<template>
	<div class="team-logo">
		<van-panel>
			<div class="van-cell van-panel__header" slot="header">
				<b>{{ teamInfo.symbol }}</b>的LOGO
			</div>
			<div class="container">
				<div class="choose-logo">
					<van-image v-if="logo" round width="2rem" height="2rem" :src="logo" />
					<van-icon v-else class="logo-icon" name="user-circle-o" />
					<p>点击修改</p>
					<input type="file" ref="file" @change="handleUpload" class="upload-btn">
				</div>
				<div class="preview">
					<img class="preview" src="../../assets/images/avatar.jpg" alt="avatar">
					<van-image v-if="logo" round width="0.8rem" height="0.8rem" :src="logo" />
					<p>效果预览</p>
				</div>
			</div>
		</van-panel>
		<van-button square size="large" type="primary" :disabled="walletInfo.did !== owner" @click="handleSubmit">确认修改</van-button>
		<van-popup
		v-model="show"
		position="top">
			<div class="cropper-content">
				<div class="cropper" style="text-align:center">
					<van-loading v-if="!option.img" type="spinner" />
					<vueCropper
					v-else
					ref="cropper"
					:img="option.img"
					:outputSize="option.size"
					:outputType="option.outputType"
					:info="false"
					:full="option.full"
					:canMove="option.canMove"
					:canMoveBox="option.canMoveBox"
					:original="option.original"
					:autoCrop="option.autoCrop"
					:fixed="option.fixed"
					:fixedNumber="option.fixedNumber"
					:centerBox="option.centerBox"
					:infoTrue="option.infoTrue"
					:fixedBox="option.fixedBox"
					></vueCropper>
				</div>
				<van-button type="primary" size="large" @click="finish">裁剪</van-button>
			</div>
		</van-popup>
	</div>
</template>

<script>
	import { mapState, mapActions } from 'vuex'
	import { uploadImg, getPicBySymbol, buildTeam } from '@/util/api'
	import { sleep, blobToFile } from '@/util/common'
	import { SET_TEAM_INFO } from '@/vuex/constants'
	import { VueCropper }  from 'vue-cropper'
	export default {
		name: 'teamLogo',
		data() {
			return {
				logo: '',
				file: null,
				owner: '',
				filename: '',
				show: false,
				option: {
					img: '', // 裁剪图片的地址
					info: true, // 裁剪框的大小信息
					outputSize: 1, // 裁剪生成图片的质量
					outputType: 'png', // 裁剪生成图片的格式
					canScale: false, // 图片是否允许滚轮缩放
					autoCrop: true, // 是否默认生成截图框
					autoCropWidth: 300, // 默认生成截图框宽度
					autoCropHeight: 200, // 默认生成截图框高度
					fixedBox: true, // 固定截图框大小 不允许改变
					fixed: true, // 是否开启截图框宽高固定比例
					fixedNumber: [1, 1], // 截图框的宽高比例
					full: true, // 是否输出原图比例的截图
					canMoveBox: false, // 截图框能否拖动
					original: false, // 上传图片按照原始比例渲染
					centerBox: false, // 截图框是否被限制在图片里面
					infoTrue: true // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
				}
			}
		},
		computed: {
			...mapState([
				'walletInfo',
				'teamInfo'
			])
		},
		components: {
			VueCropper
		},
		async mounted() {
			this.logo = this.teamInfo.url
			await sleep()
			const { data } = await getPicBySymbol(this.teamInfo.symbol)
			this.owner = data && data.owner_did
		},
		methods: {
			async handleUpload() {
				const file = this.$refs.file.files[0]
				const maxFileSize = 1024 * 1024 * 10
				if (!/.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(file.name)) {
					return this.$toast('图片类型必须是gif,jpeg,jpg,png中的一种')
				}
				if (file.size > maxFileSize) {
					return this.$toast('图片尺寸超过10M了')
				}

				this.show = true
				this.filename = file.name

				const self = this
				let imgFile = new FileReader()
				imgFile.readAsDataURL(file)
				imgFile.onload = function() {
					setTimeout(() => {
						self.option.img = this.result
					}, 500)
				}
				// const data = new FormData()
				// data.append('file', file)
				// const rs = await uploadImg(data)
				// this.logo = `https://static.chain.pro/${rs.data}`
			},
			finish() {
				this.$refs.cropper.getCropBlob(async blob => {
					this.show = false
					this.option.img = ''
					const file = blobToFile(blob, this.filename)
					const data = new FormData()
					data.append('file', file, this.filename)
					const rs = await uploadImg(data)
					this.logo = `https://static.chain.pro/${rs.data}`
				})
			},
			async handleSubmit() {
				if (!this.logo) return this.$toast('请选择logo')
				const rs = await buildTeam({
					did: this.walletInfo.did,
					url: this.logo
				})
				if (rs.hasErrors) this.$toast.error(rs.message)
				this[SET_TEAM_INFO]({
					...this.teamInfo,
					url: this.logo
				})
				this.$dialog.confirm({
					title: '温馨提示',
					message: `团队LOGO已更新！\n立即去生成${this.teamInfo.symbol}的区块身份头像？`,
				}).then(() => {
					this.$router.replace({ path: '/avatar', query: { teamname: this.teamInfo.name } })
				}).catch(console.log)
			},
			...mapActions([
				SET_TEAM_INFO
			])
		}
	}
</script>

<style lang="scss">
	@import '../../assets/css/variables.scss';

	.team-logo {
		font-size: $baseFontSize;
		.van-panel__header {
			b {
				font-size: $largeFontSize;
				margin-right: $smallGutter;
				color: $red;
			}
		}
		.container {
			display: flex;
			justify-content: space-around;
			align-items: center;
			position: relative;
			padding: $mediumGutter 0;

			p {
				text-align: center;
				margin-top: 10px;
				color: $grey;
			}

			.van-image--round {
				background-color: $dark;

				img {
					transform: scale(0.8);
				}
			}

			.choose-logo {
				position: relative;

				.logo-icon {
					font-size: 100px;
					color: $dark;
				}
			}

			.preview {
				position: relative;
				width: 100px;

				.van-image--round {
					position: absolute;
					right: 0;
					top: 70px;
				}
			}

			.ivu-upload {
				position: absolute;
				width: 100%;
				height: 100%;
				overflow: hidden;
				left: 0;
				top: 0;
				z-index: 999;
			}

			.upload-btn {
				position: absolute;
				width: 100%;
				height: 100%;
				left: 0;
				top: 0;
				opacity: 0;
				z-index: 1000;
			}
		}

		.van-button {
			margin-top: 30px;
		}
		.van-loading {
			top: 50%;
			transform: translateY(-50%);
		}
		.cropper-content {
			.cropper {
				width: auto;
				height: 260px;
			}
			.van-button {
				margin-top: 0;
			}
		}
	}
</style>
