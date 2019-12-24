<template>
<div>
  <div class="team-creationn">
	<ValidationObserver v-slot="{ invalid }">
	  <van-cell-group title="团队名称" :border="false">
		<ValidationProvider v-slot="{ errors }" rules="required" name="name">
		  <van-field
		  v-model="didForm.name"
		  :error-message="errors[0]"
		  placeholder="请输入团队名称" />
		</ValidationProvider>
	  </van-cell-group>
	  <van-cell-group title="团队标识" :border="false">
		<ValidationProvider v-slot="{ errors }" rules="required" name="symbol">
		  <van-field
		  v-model="didForm.symbol"
		  :error-message="errors[0]"
		  placeholder="请设置您的团队标识" />
		</ValidationProvider>
	  </van-cell-group>
	  <van-cell-group title="描述信息" :border="false">
		<ValidationProvider v-slot="{ errors }" name="description">
		  <van-field v-model="didForm.description"
		  :error-message="errors[0]"
		  placeholder="请输入描述" />
		</ValidationProvider>
	  </van-cell-group>
	  <van-cell-group title="团队网址" :border="false">
		<ValidationProvider v-slot="{ errors }" name="website">
		  <van-field v-model="didForm.website"
		  :error-message="errors[0]"
		  placeholder="请输入团队网址" />
		</ValidationProvider>
	  </van-cell-group>
	  <van-button type="primary" square
	  class="btn-submit"
	  size="large"
	  :disabled="invalid" @click="handleSubmit">创建团队</van-button>
	</ValidationObserver>
  </div>
</div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { SET_TEAM_INFO } from '@/vuex/constants'
import { setGroupName } from '@/util/api'
export default {
	name: 'teamName',
	data() {
		return {
			qrcode: null,
			reqType: 'create',
			didForm: {
				name: '',
				symbol: '',
				description: '',
				website: ''
			},
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
	methods: {
		async handleSubmit() {
			this.$store.commit('showLoading')

			const params = Object.assign({}, { did: this.walletInfo.did }, this.didForm)
			const rs = await setGroupName(params)
			if (rs.hasErrors) {
				this.$store.commit('hideLoading')
				return this.$toast(rs.message)
			}
			const data = JSON.stringify({
				address: this.walletInfo.address,
				method: 'setGroupName',
				params: [this.didForm.name]
			})

			this.$socket.emit('sign', data)

			const teamInfo = {
				...this.teamInfo,
				...this.didForm
			}
			this[SET_TEAM_INFO](teamInfo)
		},
		...mapActions([
			SET_TEAM_INFO
		])
	}
};
</script>
