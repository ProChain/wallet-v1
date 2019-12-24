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
			<div v-else class="no-content">
				没有找到DID，如果您刚更换头像，可能需要等4小时才能检测到
			</div>
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getWechatUser, decodeAvatar } from '@/util/api'
import { convert } from '@/util/chain'
import { sleep } from '@/util/common'
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
	mounted() {
		this.$nextTick(async() => {
			const url = window.location.href
			const part1 = url.split('&state')[0]
			const code = part1.split('code=')[1]

			await sleep(300)

			const { data: userInfo } = await getWechatUser(code)
			userInfo.headimgurl = userInfo.headimgurl.replace(/\d+$/, 0)
			this.userInfo = userInfo

			const {
				data: {
					result
				}
			} = await decodeAvatar(userInfo.headimgurl)
			this.did = result

			if (result.length === 6) {
				this.did = await convert(result, 'index')
			}
		})
	}
}
</script>
<style lang="scss">
	@import '../../assets/css/variables.scss';
	.decode-card {
	font-size: $baseFontSize;
	padding: $mediumGutter;
		.decode {
			width: 30%;
		}
	.my-did {
	  margin: $mediumGutter 0;
	}
	}
</style>
