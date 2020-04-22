<template>
	<div class="qrcode">
		<van-cell-group title="推荐人" :border="false">
			<van-cell :title="superior | clip(18, -10) || '您没有推荐人'" :center="true">
			</van-cell>
		</van-cell-group>
		<van-cell-group title="推荐人联系方式" :border="false" class="contact">
			<van-cell v-if="!info.admin_qrcode" title="未登记" :center="true"></van-cell>
			<van-image v-else :src="info.admin_qrcode">
				<template v-slot:loading>
					<van-loading type="spinner" size="20" />
				</template>
			</van-image>
		</van-cell-group>
		<van-panel title="推荐人社群" class="mt-medium">
			<div class="qrcode-list" v-if="info.group_qrcode_list.length">
				<dl>
					<!-- <dt>
						<img :src="info.url"
						 alt="">
						{{ info.name }}
					</dt> -->
					<dd v-for="(item, index) in info.group_qrcode_list">
						<div class="qrcode" :id="`qrcode${index}`">
							<van-image :src="item">
								<template v-slot:loading>
									<van-loading type="spinner" size="20" />
								</template>
							</van-image>
						</div>
					</dd>
				</dl>
			</div>
			<div v-else class="no-content">
				管理员还没有提交二维码
			</div>
		</van-panel>
	</div>
</template>
<script>
	import { mapState } from 'vuex'
	import { getTeamInfo } from '@/util/api'
	import { convert } from '@/util/chain'
	import QRCode from 'qrcodejs2'
	export default {
		name: 'qrcode',
		data() {
			return {
				info: {
					group_qrcode_list: []
				},
				qrList: [],
				superior: ''
			}
		},
		computed: {
			...mapState([
				'walletInfo'
			])
		},
		async mounted() {
			// 上级did
			const { result } = await convert(this.walletInfo.superior, 'hash')
			this.superior = result
			const info = await getTeamInfo(result)
			if (info.data) {
				this.info = info.data
				// this.qrList = this.info.group_qrcode_list.map(v => {
				// 	return {
				// 		origin: v,
				// 		dest: ''
				// 	}
				// })
			}
			setTimeout(() => {
				// this.generateQrcode()
			}, 500)
		},
		methods: {
			generateQrcode() {
				this.qrList.forEach((v, i) => {
					const id = document.querySelector(`#qrcode${i}`)
					v.dest = new QRCode(id, {
						text: v.origin,
						width: 350,
						height: 350,
						colorDark: '#000000',
						colorLight: '#ffffff',
						correctLevel: QRCode.CorrectLevel.H
					})
				})
			}
		}
	}
</script>
<style lang="scss">
	@import '../../assets/css/variables.scss';

	.qrcode {
		font-size: $mediumFontSize;
		.contact {
			text-align: center;
			.van-cell__title {
				text-align: left;
			}
			.van-image {
				width: 260px;
				height: 260px;
				text-align: center;
				padding: $largeGutter 0;
				overflow: hidden;
			}
		}
		.van-panel__content {
			padding: 0 0 $largeGutter;

			dt {
				display: flex;
				align-items: center;
				font-size: $largeFontSize;

				img {
					width: 60px;
					margin: 0 $largeGutter;
				}
			}

			dd {
				font-size: $smallFontSize;
				margin: $largeGutter auto;
				.placeholder {
					height: 100%;
				}
				.qrcode {
					width: 90%;
					margin: 0 auto;
					overflow: hidden;
					img {
						width: 100%;
					}
				}
			}

			p {
				text-align: center;
				color: $grey;
			}
		}
	}
</style>
