export interface Payment{
	method: {
		cardholder: string,
		card_type: string,
		card_digits: string
	},
	uri: string,
	status: string
}