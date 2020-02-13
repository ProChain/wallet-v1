<template>
	<div class="container">
		<div class="lucky-wheel">
			<div class="lucky-title"></div>
			<div class="wheel-main">
				<div class="wheel-pointer-box">
					<div class="wheel-pointer" @click="rotateHandle()" :style="{transform:rotateAnglePointer,transition:rotateTransitionPointer}"></div>
				</div>
				<div class="wheel-bg" :style="{transform:rotateAngle,transition:rotateTransition}">
					<div class="prize-list">
						<div class="prize-item" v-for="(item,index) in prizeList" :key="index">
							<div class="prize-pic">
								<img :src="item.icon">
							</div>
							<div class="prize-count" v-if="item.count">
								{{item.count}}
							</div>
							<div class="prize-type">
								{{item.name}}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="main">
			<div class="main-bg"></div>
			<div class="bg-p"></div>
			<div class="content">
				<p class="did">{{ did | clip(18, -10) || '未识别到您的DID' }}</p>
				<div class="lotteryTicket">免费抽奖次数： {{ lotteryTicket }}</div>
				<div class="lottery-balance">奖池余额：<b>{{ lotteryBalance | money }}</b></div>
			</div>
			<div class="tip">
				<div class="tip-title">活动规则</div>
				<div class="tip-content">
					<p> 1.使用区块链头像后，即可获得一次幸运大转盘的机会</p>
					<p> 2.中奖后的PRA会直接转入您区块链头像所包含的DID账号中</p>
					<p> 3.如您刚更换区块链头像，需要等4个小时生效，请稍后再来尝试</p>
				</div>
			</div>
		</div>
		<div class="toast" v-show="toastControl">
			<div class="toast-container">
				<img :src="toastPictrue" class="toast-picture">
				<div class="close" @click="closeToast()"></div>
				<div class="toast-title">
					{{toastTitle}}
				</div>
				<div class="toast-btn">
					<div class="toast-cancel" @click="closeToast">关闭</div>
				</div>
			</div>
		</div>
		<div class="toast-mask" v-show="toastControl"></div>
	</div>
</template>
<script>
	import { mapActions } from 'vuex'
	import { getWechatUser, decodeAvatar, getGift, drawLottery, getLotteryRecord, getLotteryBalance } from '@/util/api'
	import { SET_TOKEN } from '@/vuex/constants'
	export default {
		name: 'luckyWheel',
		data() {
			return {
				easejoyBean: 0, // 金豆
				lotteryTicket: 0, // 抽奖次数
				did: '',
				lotteryBalance: 0,
				prizeList: [{
						icon: require('../../assets/images/activity/bean_500.png'), // 奖品图片
						count: 50, // 奖品数量
						name: 'PRA', // 奖品名称
						isPrize: 1 // 该奖项是否为奖品
					},
					{
						icon: require('../../assets/images/activity/bean_one.png'),
						count: 15,
						name: 'PRA',
						isPrize: 1
					},
					{
						icon: require('../../assets/images/activity/bean_five.png'),
						count: 20,
						name: 'PRA',
						isPrize: 1
					},
					{
						icon: require('../../assets/images/activity/point_five.png'),
						count: 5,
						name: 'PRA',
						isPrize: 1
					},
					{
						icon: require('../../assets/images/activity/point_ten.png'),
						count: 10,
						name: 'PRA',
						isPrize: 1
					},
					{
						icon: require('../../assets/images/activity/bean_500.png'),
						count: 30,
						name: 'PRA',
						isPrize: 1
					},
					{
						icon: require('../../assets/images/activity/give_up.png'),
						count: 0,
						name: '未中奖',
						isPrize: 0
					},
					{
						icon: require('../../assets/images/activity/bean_500.png'),
						count: 40,
						name: 'PRA',
						isPrize: 1
					}
				], // 奖品列表
				toastControl: false, // 抽奖结果弹出框控制器
				hasPrize: false, // 是否中奖
				startRotatingDegree: 0, // 初始旋转角度
				rotateAngle: 0, // 将要旋转的角度
				startRotatingDegreePointer: 0, // 指针初始旋转角度
				rotateAnglePointer: 0, // 指针将要旋转的度数
				rotateTransition: 'transform 6s ease-in-out', // 初始化选中的过度属性控制
				rotateTransitionPointer: 'transform 12s ease-in-out', // 初始化指针过度属性控制
				clickFlag: true, // 是否可以旋转抽奖
				index: 0
			};
		},
		async mounted() {
			try {
				this.initPrizeList()
				const url = window.location.href
				const part1 = url.split('&state')[0]
				const code = part1.split('code=')[1]

				const { data: lotteryBalance } = await getLotteryBalance()
				this.lotteryBalance = lotteryBalance && lotteryBalance.result

				const { data: userInfo } = await getWechatUser(code)
				const headimgurl = userInfo.headimgurl.replace(/\d+$/, 0)
				this[SET_TOKEN](userInfo.token)
				const { data: { result } } = await decodeAvatar(headimgurl)
				this.did = result
				if (this.did) {
					const { data: { list } } = await getLotteryRecord(this.did)
					if (list.length === 0) {
						this.lotteryTicket = 1
					} else {
						const { createTime } = list[0]
						if (new Date(createTime).toDateString() !== new Date().toDateString()) {
							this.lotteryTicket = 1
						}
					}
				}
			} catch (error) {
				console.log(error)
			}
		},
		computed: {
			toastTitle() {
				return this.hasPrize ?
					'恭喜您，获得' + this.prizeList[this.index].count + ' ' + this.prizeList[this.index].name :
					'未中奖'
			},
			toastPictrue() {
				return this.hasPrize ?
					require('../../assets/images/activity/congratulation.png') :
					require('../../assets/images/activity/sorry.png')
			}
		},
		methods: {
			// 此方法为处理奖品数据
			async initPrizeList() {
				const { data: { list } } = await getGift();
				this.prizeList = this.prizeList.map((v, i) => {
					let { id, name, reward } = list[i]
					name = name.replace('PRA', '').replace('未中奖', '')
					v.id = id
					v.count = name
					v.reward = reward
					return v
				})

				console.log(this.prizeList, 'prize list')
			},
			async rotateHandle() {
				if (!this.did) return this.$toast('没有检测到您的DID，无法参与抽奖');
				const data = await drawLottery(this.did)
				if (data.hasErrors) {
					this.$toast(data.message)
				} else {
					const { data: { id } } = data
					this.index = id - 1 // 指定每次旋转到的奖品下标
					this.rotating()
				}
			},
			rotating() {
				if (!this.clickFlag) return
				var type = 0 // 默认为 0  转盘转动 1 箭头和转盘都转动(暂且遗留)
				var duringTime = 5 // 默认为1s
				// var random = Math.floor(Math.random() * 7)
				var resultIndex = this.index // 最终要旋转到哪一块，对应prize_list的下标
				var resultAngle = [337.5, 292.5, 247.5, 202.5, 157.5, 112.5, 67.5, 22.5] // 最终会旋转到下标的位置所需要的度数
				var randCircle = 6 // 附加多转几圈，2-3
				this.clickFlag = false // 旋转结束前，不允许再次触发
				if (type === 0) {
					// 转动盘子
					var rotateAngle =
						this.startRotatingDegree +
						randCircle * 360 +
						resultAngle[resultIndex] -
						this.startRotatingDegree % 360;
					this.startRotatingDegree = rotateAngle;
					this.rotateAngle = 'rotate(' + rotateAngle + 'deg)';
					// // //转动指针
					// this.rotateAnglePointer = 'rotate('+this.startRotatingDegreePointer + 360*randCircle+'deg)'
					// this.startRotatingDegreePointer =360*randCircle
					var that = this
					// 旋转结束后，允许再次触发
					setTimeout(() => {
						that.clickFlag = true
						that.gameOver()
					}, duringTime * 1000 + 1500) // 延时，保证转盘转完
				} else {
					//
				}
			},
			gameOver() {
				this.toastControl = true
				this.hasPrize = this.prizeList[this.index].isPrize
				this.lotteryTicket = 0
			},
			closeToast() {
				this.toastControl = false
			},
			...mapActions([
				SET_TOKEN
			])
		}
	};
</script>
<style lang="scss" scoped>
	@import '../../assets/css/variables.scss';

	.container {
		font-size: $baseFontSize;

		.lucky-wheel {
			width: 100%;
			height: 490px;
			background: rgb(252, 207, 133) url("../../assets/images/activity/color_pillar.png") no-repeat center bottom;
			background-size: 100%;
			padding-top: 30px;

			.lucky-title {
				width: 100%;
				height: 130px;
				background: url("../../assets/images/activity/lucky_title.png") no-repeat center top;
				background-size: 100%;
			}

			.wheel-main {
				display: flex;
				align-items: center;
				justify-content: center;
				position: relative;

				.wheel-bg {
					width: 290px;
					height: 290px;
					background: url("../../assets/images/activity/draw_wheel.png") no-repeat center top;
					background-size: 100%;
					color: #fff;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-content: center;
					transition: transform 3s ease;

					&>div {
						text-align: center;
					}

					.prize-list {
						width: 100%;
						height: 100%;
						position: relative;

						.prize-item {
							width: 58px;
							height: 88px;
							position: absolute;
							top: 0;
							left: 0;
							z-index: 2;

							.prize-pic img {
								width: 70px;
								height: auto;
								margin: 10px auto 0;
							}

							&:first-child {
								top: 15px;
								left: 150px;
								transform: rotate(20deg);
							}

							&:nth-child(2) {
								top: 63px;
								left: 205px;
								transform: rotate(67deg);
							}

							&:nth-child(3) {
								top: 135px;
								left: 205px;
								transform: rotate(-250deg);
							}

							&:nth-child(4) {
								top: 186px;
								left: 156px;
								transform: rotate(-210deg);
							}

							&:nth-child(5) {
								top: 189px;
								left: 82px;
								transform: rotate(-160deg);
							}

							&:nth-child(6) {
								top: 135px;
								left: 33px;
								transform: rotate(-111deg);
							}

							&:nth-child(7) {
								top: 65px;
								left: 33px;
								transform: rotate(-69deg);
							}

							&:nth-child(8) {
								top: 15px;
								left: 82px;
								transform: rotate(-20deg);
							}
						}
					}
				}

				.wheel-pointer-box {
					position: absolute;
					top: 50%;
					left: 50%;
					z-index: 100;
					transform: translate(-50%, -60%);
					width: 100px;
					height: 100px;

					.wheel-pointer {
						width: 100px;
						height: 100px;
						background: url("../../assets/images/activity/draw_btn.png") no-repeat center top;
						background-size: 100%;
						transform-origin: center 60%;
					}
				}
			}
		}
	}

	.main {
		position: relative;
		width: 100%;
		background: rgb(243, 109, 86);
		padding-bottom: 54px;

		.main-bg {
			width: 100%;
			height: 210px;
			position: absolute;
			top: -59px;
			left: 0;
			background: url("../../assets/images/activity/luck_bg.png") no-repeat center top;
			background-size: 100%;
		}

		.bg-p {
			width: 100%;
			height: 80px;
			background: rgb(252, 207, 133);
		}

		.content {
			position: absolute;
			top: 5.6px;
			left: 0;
			background: rgb(243, 109, 86);
			width: 100%;
			height: 166px;
			color: #ffeb39;
			text-align: center;
			.lottery-balance {
				b {
					font-size: 15px;
				}
			}
		}

		.tip {
			position: relative;
			margin: 20px auto 0;
			width: 300px;
			border: 0.0313rem solid #fbc27f;

			.tip-title {
				font-size: $largeFontSize;
				position: absolute;
				top: -22px;
				left: 50%;
				transform: translate(-50%, 0);
				color: #fccc6e;
				background: rgb(243, 109, 86);
				padding: 10px 20px;
			}

			.tip-content {
				padding: 30px 20px;
				color: #fff8c5;
				line-height: 1.5;
			}
		}
	}

	.toast-mask {
		position: fixed;
		top: 0;
		left: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 10000;
		width: 100%;
		height: 100%;
	}

	.toast {
		position: fixed;
		top: 50%;
		left: 50%;
		z-index: 20000;
		transform: translate(-50%, -50%);
		width: 254px;
		background: #fff;
		border-radius: 10px;
		padding: 10px;
		background-color: rgb(252, 244, 224);

		.toast-container {
			position: relative;
			width: 100%;
			height: 100%;
			border: 0.0313rem dotted #fccc6e;
		}

		.toast-picture {
			position: absolute;
			top: -88px;
			left: -18px;
			width: 300px;
		}

		.toast-title {
			padding: 40px 0;
			color: #fc7939;
			text-align: center;
		}

		.toast-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 20px;

			&>div {
				background-image: -moz-linear-gradient(-18deg,
					rgb(242, 148, 85) 0%,
					rgb(252, 124, 88) 51%,
					rgb(252, 124, 88) 99%);

				background-image: -ms-linear-gradient(-18deg,
					rgb(242, 148, 85) 0%,
					rgb(252, 124, 88) 51%,
					rgb(252, 124, 88) 99%);
				background-image: -webkit-linear-gradient(-18deg,
					rgb(242, 148, 85) 0%,
					rgb(252, 124, 88) 51%,
					rgb(252, 124, 88) 99%);
				box-shadow: 0rem 0.125rem 0rem 0rem rgba(174, 34, 5, 0.7);
				width: 100px;
				height: 30px;
				border-radius: 40px;
				text-align: center;
				line-height: 30px;
				color: #fff;
			}
		}

		.close {
			position: absolute;
			top: -20px;
			right: -20px;
			width: 34px;
			height: 34px;
			background: url("../../assets/images/activity/close_store.png") no-repeat center top;
			background-size: 100%;
		}
	}
</style>
