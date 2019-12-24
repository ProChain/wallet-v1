<template>
  <div class="update-pubkey">
	  <ValidationObserver v-slot="{ invalid }">
	    <van-cell-group title="更换公钥" :border="false">
	  	<ValidationProvider v-slot="{ errors }" rules="required" name="pubkey">
	  	  <van-field
	  	  v-model="pubkey"
	  	  :error-message="errors[0]"
	  	  placeholder="请输入新的公钥地址" />
	  	</ValidationProvider>
	    </van-cell-group>
	    <van-button type="primary" square
	    class="btn-submit"
	    size="large"
	    :disabled="invalid" @click="handleUpdatePubkey">确认更换</van-button>
	  </ValidationObserver>
  </div>
</template>
<script>
import { ValidationObserver, ValidationProvider } from 'vee-validate'
export default {
	name: 'walletUpdatePubkey',
	data() {
		return {
			pubkey: ''
		}
	},
	components: {
		ValidationProvider,
		ValidationObserver
	},
	methods: {
		async handleUpdatePubkey() {
			const data = JSON.stringify({
				address: this.metadata.address,
				method: 'update',
				params: [this.pubkey]
			})

			this.$store.commit('showLoading')
			this.$socket.emit('sign', data)
		}
	}
};
</script>
<style lang="scss">
  @import '../../assets/css/variables.scss';
  .updatedid-modal  {
	width: 80%;
	background: #fff;
	button {
	  margin-top: 30px;
	}
  }
</style>
