export function money(amount) {
	if (amount) {
		const newAmount = Number(amount)
		return newAmount.toFixed(2) + ' PRA'
	} else {
		return '0 PRA'
	}
}

export function person(num) {
	if (num) {
		return Math.floor(num) + '人'
	} else {
		return '0人'
	}
}
