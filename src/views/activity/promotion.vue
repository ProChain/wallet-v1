<template>
	<div class="promotion">
		<van-notice-bar v-if="showNotice" text="请先创建团队再分享此页面!" left-icon="volume-o" />
		<div class="bg"></div>
		<div class="bg-color"></div>
		<div class="content">
			<div class="profile">
				<div class="user">
					<van-image width="1.2rem" height="1.2rem" :src="teamInfo.url" />
					<div>
						<p>
							{{ teamInfo.name }} 共识合伙人
						</p>
						<p>
							{{ nickName }}
						</p>
					</div>
				</div>
				<h2>
					赠送你一个DID名额
				</h2>
				<h3>
					他的剩余名额 {{ members }} / {{ quota }}
				</h3>
			</div>
			<div class="code">
				<h3>推荐码</h3>
				<h2>{{ shortIndex }}</h2>
			</div>
			<div class="desc">
				<p>
					“DID（分散式身份）是Web3.0的重要基础设施，让您真正掌握自己的注意力价值与数据主权，随时随地获得Web3.0的广告收益”
				</p>
			</div>
			<van-button color="#fed01d" round size="large" @click="create">立即创建</van-button>
		</div>
	</div>
</template>

<script>
	import { convert, getMetadata } from '@/util/chain'
	import { getTeamInfo, getWxSignature } from '@/util/api'
	import wx from 'weixin-js-sdk'
	export default {
		name: 'promotion',
		data() {
			return {
				shortIndex: '',
				nickName: '',
				members: 0,
				quota: 0,
				teamInfo: {},
				showNotice: false
			}
		},
		async created() {
			try {
				const { short_index: short, nick_name: nickName } = this.$route.query
				this.shortIndex = short
				this.nickName = nickName
				const title = `"${this.nickName}"赠送你一个DID名额`
				document.title = title
				var objs = document.getElementsByTagName('meta')
				for (var i = 0; i < objs.length; i++) {
					if (objs[i].name === 'description') {
						objs[i].content = '拥有DID，轻松领奖励，奖励秒到账，越领越丰厚'
					}
				}
				const { result } = await convert(short, 'index')
				const { data: metadata } = await getMetadata(result)
				this.quota = metadata.locked_records ? metadata.locked_records.max_quota : 0
				this.members = this.quota === 0 ? 0 : this.quota - metadata.subordinate_count
				const teamInfo = await getTeamInfo(result)
				this.teamInfo = teamInfo.data || {}
				this.showNotice = !this.teamInfo.name
				const link = window.location.href.split('#')[0]
				const { data } = await getWxSignature(link)
				const imgUrl = 'https://static.chain.pro/chain/praad.gif'
				wx.config({
					debug: process.env.VUE_APP_MODE === 'development',
					appId: data.appId,
					timestamp: data.timestamp,
					nonceStr: data.nonceStr,
					signature: data.signature,
					jsApiList: ['hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem', 'updateAppMessageShareData']
				})
				wx.hideAllNonBaseMenuItem()
				wx.ready(() => {
					console.log('wx ready')
					wx.updateAppMessageShareData({
						title,
						desc: '拥有DID，轻松领奖励，奖励秒到账，越领越丰厚',
						link: window.location.href,
						imgUrl,
						success() {
							console.log('share success')
						}
					})
					wx.showAllNonBaseMenuItem()
				})
				wx.error((e) => {
					console.log(e)
					alert(e)
				})
			} catch (e) {
				console.log(e)
				alert(e)
			}
		},
		methods: {
			create() {
				window.location.href = `${process.env.VUE_APP_DOMAIN}/#/?short_index=${this.shortIndex}`
			}
		}
	}
</script>

<style lang="scss">
	@import '../../assets/css/variables.scss';

	.promotion {
		font-size: $baseFontSize;
		text-align: center;
		color: #fff;
		background: url(../../assets/images/activity/bg.jpg) no-repeat;
		background-size: cover;

		.van-notice-bar {
			width: 100%;
			position: absolute;
			left: 0;
			top: 0;
		}

		.bg {
			width: 100%;
			height: 100%;
			background: #ff0000;
			opacity: 0.7;
			position: absolute;
			left: 0;
			top: 0;
			z-index: 2;
		}

		.content {
			padding: $largeGutter*2 $mediumGutter;
			position: relative;
			z-index: 3;

			h3 {
				font-weight: normal;
			}

			h2 {
				font-size: $largeFontSize*1.7;
			}

			h3 {
				margin: $smallGutter;
				color: #ffb7ab;
			}

			.profile {
				.user {
					display: flex;
					justify-content: center;
					align-items: center;

					p {
						text-align: left;
						font-size: $smallFontSize;
						color: #ffb7ab;
						margin-left: $smallGutter;

						&:last-of-type {
							font-size: $largeFontSize;
							font-weight: bold;
							color: #fff;
						}
					}
				}

				h2 {
					margin-top: $largeGutter*2;
				}
			}

			.code {
				margin: $largeGutter*2 auto;
				h2 {
					font-weight: normal;
				}
			}

			.desc {
				width: 220px;
				margin: 0 auto;
				background: rgba(255, 255, 255, 0.3);
				padding: 20px;
				line-height: $largeGutter*1.2;
				text-align: left;
				border-radius: 5px;

			}
			.van-button {
				width: 260px;
				margin-top: $largeGutter;
				color: #f13a26!important;
				font-size: $largeFontSize*1.2;
				animation: scaleDrew 2.5s ease-in-out infinite;
			}

		}

		.van-notice-bar {
			z-index: 999;
		}
	}

	@keyframes move {
		0% {
			font-size: $mediumFontSize;
		}

		50% {
			font-size: $largeFontSize;
		}

		100% {
			font-size: $mediumFontSize;
		}
	}

	@keyframes scaleDrew {
		0% {
			transform: scale(1);
		}

		25% {
			transform: scale(1.05);
		}

		50% {
			transform: scale(1);
		}

		75% {
			transform: scale(1.05);
		}
	}
</style>
