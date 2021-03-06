<template>
	<div class="avatar-component">
		<div class="avatar-card">
			<p class="tips">
				区块链头像中包含了您的DID信息，通过PRM:DID协议的服务，您可获得广告营销激励。此外通过DID，可以查找到对应绑定的btc、eth等地址，实现一个地址，收所有币。
			</p>
			<van-steps :active="current" active-icon="success" active-color="#38f">
				<van-step>选择头像</van-step>
				<van-step>选择背景</van-step>
				<van-step>选择LOGO</van-step>
			</van-steps>
			<!-- <h2>当前头像</h2> -->
			<div class="update-avatar">
				<img v-if="avatar" class="avatar" :src="avatar" />
				<van-icon v-else class="avatar-icon" name="user-circle-o" />
				<van-uploader class="upload" :max-size="1024 * 1024 * 10" @oversize="$toast('文件大小不能超过10M')" :preview-image="false"
				 :after-read="handleSuccess" />
				<p>点击左图手动选择新图生成您的区块链头像</p>
			</div>
			<div v-if="result.avatar" class="choose-color">
				<h2>选择背景色</h2>
				<ul class="bgcolors">
					<li v-for="(color, i) in colorArr" :key="i" :class="{ 'active': colorActive == i}" @click="handleColorChange(color, i)">
						<span :style="{background: color.replace('0x', '#')}"></span>
					</li>
				</ul>
			</div>
			<div v-if="result.color && !teamname" class="choose-logo">
				<h2>选择LOGO</h2>
				<ul class="logos first">
					<li v-for="(item, i) in logoArr.slice(0, 1)" :key="i" :class="{ 'active': logoActive == i}" @click="handleLogoChange(item, i)">
						<span>{{ item.symbol }}</span>
					</li>
				</ul>
				<van-collapse v-model="activeItem" :border="false">
					<van-collapse-item :is-link="false" name="1">
						<div class="more" slot="title">
							选择更多
							<van-icon v-if="activeItem.length === 0" name="arrow-down" />
							<van-icon v-else name="arrow-up" />
						</div>
						<ul class="logos">
							<li v-for="(item, i) in logoArr.slice(1)" :key="i+1" :class="{ 'active': logoActive == i + 1 }" @click="handleLogoChange(item, i + 1)">
								<span>{{ item.symbol }}</span>
							</li>
						</ul>
					</van-collapse-item>
				</van-collapse>
			</div>
			<div class="new-avatar" v-if="newAvatar">
				<img :src="newAvatar" />
				<p class="no-content avatar-tip">
					满意吗？可以长按图片保存到本地，手动更换您的微信头像
				</p>
			</div>
			<p v-if="!newAvatar && tip" class="no-content">
				{{ tip }}
			</p>
		</div>
		<van-popup v-model="show" position="top">
			<div class="cropper-content">
				<div class="cropper" style="text-align:center">
					<van-loading v-if="!option.img" type="spinner" />
					<vueCropper v-else ref="cropper" :img="option.img" :outputSize="option.size" :outputType="option.outputType" :info="false"
					 :full="option.full" :canMove="option.canMove" :canMoveBox="option.canMoveBox" :original="option.original"
					 :autoCrop="option.autoCrop" :fixed="option.fixed" :fixedNumber="option.fixedNumber" :centerBox="option.centerBox"
					 :infoTrue="option.infoTrue" :fixedBox="option.fixedBox" @realTime="realTime"></vueCropper>
				</div>
				<van-button type="primary" size="large" @click="finish">裁剪</van-button>
			</div>
		</van-popup>
	</div>
</template>
<script>
	import { mapState } from 'vuex'
	import { getAvatarStyle, encodeAvatar, getTeamLogo, getTeamInfo, uploadImg } from '@/util/api'
	import { sleep, blobToFile } from '@/util/common'
	import { convert } from '@/util/chain'
	import { VueCropper } from 'vue-cropper'
	export default {
		name: 'walletAvatar',
		data() {
			return {
				avatar: '',
				colorArr: [],
				imgArr: [],
				teamname: '',
				logoArr: [],
				teamInfo: {},
				newAvatar: '',
				result: {},
				logoActive: 0,
				colorActive: 0,
				file: null,
				current: -1,
				previews: '',
				filename: '',
				show: false,
				activeItem: [],
				tip: '',
				option: {
					img: '', // 裁剪图片的地址
					info: true, // 裁剪框的大小信息
					outputSize: 0.8, // 裁剪生成图片的质量
					outputType: 'jpeg', // 裁剪生成图片的格式
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
					centerBox: true, // 截图框是否被限制在图片里面
					infoTrue: true // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
				}
			}
		},
		computed: {
			...mapState([
				'walletInfo',
				'userInfo'
			])
		},
		components: {
			VueCropper
		},
		watch: {
			result: {
				handler(val) {
					const teamname = this.teamname || (val.logo && val.logo.name)
					if (val.color && teamname && val.avatar) {
						this.handleCreateAvatar(val.color, teamname, val.avatar)
					}
				},
				deep: true
			},
			avatar(newVal, oldVal) {
				if (newVal && oldVal !== newVal) {
					this.handleAvatarChange(newVal)
				}
			}
		},
		async mounted() {
			localStorage.setItem('isNew', false)
			this.$store.commit('setNewbie', false)
			await sleep()
			this.avatar = this.userInfo.headimgurl
			const { teamname } = this.$route.query
			if (teamname) {
				this.teamname = teamname
			}
			const { data } = await getTeamInfo(this.walletInfo.did)
			this.teamInfo = data
		},
		methods: {
			realTime(data) {
				const h = 0.5

				this.previewStyle1 = {
					width: data.w + 'px',
					height: data.h + 'px',
					overflow: 'hidden',
					margin: '0',
					zoom: h
				}

				this.previews = data
			},
			async handleCreateAvatar(color, logo, avatar) {
				try {
					const data = await encodeAvatar(avatar, color, this.walletInfo.did, logo)
					const str = new Uint8Array(data).reduce((data, byte) => data + String.fromCharCode(
						byte), '')
					if (str.includes('"hasErrors":true')) {
						this.tip = '您已经创建了DID头像'
					} else {
						this.newAvatar = 'data:image/png;base64,' + btoa(str)
					}
				} catch (error) {
					console.log(error)
				}
			},
			async handleAvatarChange(avatar) {
				const { result } = await convert(this.walletInfo.superior, 'hash')
				const { data: { list } } = await getTeamLogo(result, this.walletInfo.did)
				this.logoArr = list
				const { data: styles } = await getAvatarStyle(avatar)
				this.colorArr = styles.list
				// this.$set(this.result, 'avatar', avatar)
				this.result = {
					...this.result,
					avatar,
					color: this.colorArr[0],
					logo: this.logoArr[0]
				}
				console.log(this.colorArr)
				this.current = 2
			},
			handleColorChange(color, i) {
				this.$set(this.result, 'color', color)
				this.colorActive = i
				this.current = 1
				if (this.teamname) {
					this.current = 2
				}
			},
			handleLogoChange(logo, i) {
				this.$set(this.result, 'logo', logo)
				this.logoActive = i
				this.current = 2
			},
			finish() {
				this.$refs.cropper.getCropBlob(async blob => {
					this.show = false
					this.option.img = ''
					const file = blobToFile(blob, this.filename)
					const data = new FormData()
					data.append('file', file, this.filename)
					const rs = await uploadImg(data)
					this.avatar = `https://static.chain.pro/${rs.data}`
				})
			},
			async handleSuccess(res) {
				const self = this
				console.log(res.file, 'url')
				this.show = true
				this.filename = res.file.name
				let imgFile = new FileReader()
				imgFile.readAsDataURL(res.file)
				imgFile.onload = function() {
					setTimeout(() => {
						self.option.img = this.result
					}, 500)
				}
			}
		}
	};
</script>

<style lang="scss">
	@import '../../assets/css/variables.scss';

	.avatar-card {
		font-size: $baseFontSize;
		background: #fff;
		min-height: 100%;

		.tips {
			border: 1PX dashed $red;
			padding: 15px;
			background: rgba(252, 75, 63, 0.3);
			margin: 10px;
		}

		h2 {
			margin: $mediumGutter 0;
			clear: both;
		}

		.update-avatar {
			display: flex;
			justify-content: space-around;
			align-items: center;
			position: relative;
			padding: 0 $mediumGutter;

			p {
				color: $red;
				font-weight: bold;
				margin-left: $mediumGutter;
			}

			img {
				width: 100px;
			}

			.avatar {
				width: 30%;
				margin: 30px 0;
			}

			.avatar-icon {
				font-size: 100px;
				color: $grey;
			}

			.upload {
				position: absolute;
				width: 100%;
				height: 100%;
				left: 0;
				top: 0;
				opacity: 0;
				z-index: 1000;
			}
		}

		.choose-color {
			padding: 0 $mediumGutter;

			.bgcolors {
				overflow: hidden;

				li {
					float: left;
					width: 20%;
					height: 35px;
					margin: $smallGutter 0;

					span {
						display: block;
						width: calc(100% - #{$mediumGutter});
						height: 100%;
						margin: 0 auto;
						border: 2px solid transparent;
						border-radius: 3px;
					}

					&.active {
						span {
							border-color: #c00;
						}
					}
				}
			}
		}

		.choose-logo {
			position: relative;
			margin: 0 $mediumGutter;
			font-size: $smallFontSize;

			.logos {
				overflow: hidden;

				li {
					float: left;
					width: 20%;
					height: 35px;
					line-height: 35px;
					margin: $smallGutter 0;
					text-align: center;

					span {
						display: block;
						width: calc(100% - #{$mediumGutter});
						height: 100%;
						margin: 0 auto;
						border: 2px solid #ddd;
						border-radius: 3px;
					}

					&.active {
						span {
							border-color: #c00;
						}
					}
				}
			}

			.first {
				width: 20%;
				position: absolute;
				left: 0;
				top: 22px;
				z-index: 99;

				li {
					width: 100%;
				}
			}

			.van-collapse {
				.van-collapse-item__content {
					color: $dark;
					padding: 0;
				}

				.van-collapse-item__title {
					padding: 0;
				}

				.van-collapse-item__wrapper {
					margin-top: $smallGutter;
				}

				.more {
					margin-left: 20%;
					text-align: center;
					width: 80px;
					height: 35px;
					line-height: 35px;
				}
			}
		}

		.img-con {
			li {
				float: left;
				width: 18%;
				margin-right: 2%;

				span {
					display: none;
					float: left;
					width: 100px;
					height: 60px;
					margin-top: 35px;
					margin-right: 50px;
				}

				img {
					float: left;
					width: 100%;
				}
			}
		}

		.new-avatar {
			display: flex;
			justify-content: space-around;
			align-items: center;
			position: relative;
			padding: 0 $largeGutter;

			img {
				width: 40%;
				margin-right: $mediumGutter;
			}

			.avatar-tip {
				color: $red;
			}
		}
	}

	.van-loading {
		top: 50%;
		transform: translateY(-50%);
	}

	.cropper-content {
		.cropper {
			width: auto;
			height: 300px;
		}
	}
</style>
