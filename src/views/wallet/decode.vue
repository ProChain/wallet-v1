<template>
	<div class="decode-component">
		<div class="decode-card">
			<van-image width="100%" :src="userInfo.headimgurl" />
			<div class="my-did" v-if="did">
				<p>
					{{ did }}
				</p>
			</div>
			<div class="tip" v-else>
				没有找到DID，如果您刚更换头像，可能需要等4小时才能检测到
			</div>
			<van-button type="primary" size="large" @click="decodePic">点击检测头像</van-button>
		</div>
	</div>
</template>
<script>
	import { mapState } from 'vuex'
	import { getWechatUser } from '@/util/api'
	import { convert } from '@/util/chain'
	import decodeAvatarLocal from '@/util/decode'
	export default {
		name: 'walletDecode',
		data() {
			return {
				decode: '',
				userInfo: {},
				did: ''
			};
		},
		computed: {
			...mapState([
				'walletInfo'
			])
		},
		async mounted() {
			const url = window.location.href
			const part1 = url.split('&state')[0]
			const code = part1.split('code=')[1]

			const { data: userInfo } = await getWechatUser(code)
			userInfo.headimgurl = userInfo.headimgurl.replace(/\d+$/, 0)
			this.userInfo = userInfo
		},
		methods: {
			async decodePic() {
				try {
					this.$store.commit('showLoading')
					this.did = await decodeAvatarLocal(this.userInfo.headimgurl)
					this.$store.commit('hideLoading')
					if (this.did.length === 6) {
						this.did = await convert(this.did, 'index')
					}
				} catch (e) {
					console.log(e)
				}
			}
		}
	}
</script>
<style lang="scss">
	@import '../../assets/css/variables.scss';

	.decode-card {
		font-size: $baseFontSize;
		padding: $largeGutter*2;
		text-align: center;

		.tip {
			color: $grey;
			padding: $largeGutter;
		}

		.my-did {
			margin: $mediumGutter 0;

			p {
				color: $grey;
				word-break: break-all;
			}
		}
	}
</style>
