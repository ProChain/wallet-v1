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
		<van-button square size="large" type="primary" @click="handleSubmit">确认修改</van-button>
	</div>
</template>

<script>
	import { mapState, mapActions } from 'vuex'
	import { uploadImg, getPicBySymbol, buildTeam } from '@/util/api'
	import { sleep } from '@/util/common'
	import { SET_TEAM_INFO } from '@/vuex/constants'
	export default {
		name: 'teamLogo',
		data() {
			return {
				logo: '',
				file: null
			}
		},
		computed: {
			...mapState([
				'walletInfo',
				'teamInfo',
				'avatar'
			])
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
				const data = new FormData()

				data.append('file', file)
				const rs = await uploadImg(data)
				this.logo = `https://static.chain.pro/${rs.data}`
			},
			async handleSubmit() {
				if (this.walletInfo.did !== this.owner) return this.$toast(`您没有权限修改${this.teamInfo.symbol}的LOGO`)
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
	}
</style>
