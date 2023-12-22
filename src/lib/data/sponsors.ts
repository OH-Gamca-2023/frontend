export interface Sponsor {
	name: string // Name of the sponsor
	logo: string // URL referencing the logo in assets/sponsors/
	darkLogo: string // URL referencing the dark logo in assets/sponsors/
	url: string // URL to the sponsor's website
}

export const sponsors: Sponsor[] = [
	{
		name: "Bratislavský kraj",
		logo: "logo-bk-farba.png",
		darkLogo: "logo-bk-farba.png",
		url: "https://bratislavskykraj.sk"
	},
	{
		name: "Mamateyka",
		logo: "mamateyka.png",
		darkLogo: "mamateyka.png",
		url: "https://mamateyka.sk"
	},
	{
		name: "ProRate",
		logo: "ProRate-light.svg",
		darkLogo: "ProRate.svg",
		url: "https://www.prorate.eu/sk/"
	},
	{
		name: "Stilus",
		logo: "stilus.svg",
		darkLogo: "stilus.svg",
		url: "https://www.stilus.sk/sk/"
	}
]

export default sponsors
