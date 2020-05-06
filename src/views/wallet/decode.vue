<template>
	<div class="decode-component">
		<div class="decode-card">
			<img class="decode" :src="userInfo.headimgurl" />
			<div class="my-did" v-if="did">
				<h2>您的DID</h2>
				<p>
					{{ did }}
				</p>
			</div>
			<div class="tip" v-else>
				没有找到DID，如果您刚更换头像，可能需要等4小时才能检测到
			</div>
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
			try {
				const url = window.location.href
				const part1 = url.split('&state')[0]
				const code = part1.split('code=')[1]

				const { data: userInfo } = await getWechatUser(code)
				userInfo.headimgurl =
					'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKiaU2ujhqaUevBuWpaD0Tia3vXxHQFUiaeEXxPSTIZQdAlzGV6gTVvG2CYLwMJv9qSjTaCOs0VTUl5g/132'
				userInfo.headimgurl = userInfo.headimgurl.replace(/\d+$/, 0)
				console.log(userInfo.headimgurl)
				this.userInfo = userInfo
				this.$store.commit('showLoading')
				this.did = await decodeAvatarLocal(userInfo.headimgurl)
				// this.$store.commit('hideLoading')
				if (this.did.length === 6) {
					this.did = await convert(this.did, 'index')
				}
			} catch (e) {
				console.log(e)
			}
		}
	}
</script>
<style lang="scss">
	@import '../../assets/css/variables.scss';

	.decode-card {
		font-size: $baseFontSize;
		padding: $mediumGutter;

		.decode {
			width: 50%;
			margin: $largeGutter auto;
		}

		.tip {
			color: $grey;
			padding: 0 $largeGutter;
		}

		.my-did {
			margin: $mediumGutter 0;

			p {
				color: $grey;
			}
		}
	}
</style>
