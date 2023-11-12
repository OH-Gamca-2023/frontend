export interface Sponsor {
	name: string // Name of the sponsor
	logo: string // URL referencing the logo in assets/sponsors/
	url: string // URL to the sponsor's website
}

export const sponsors: Sponsor[] = [
	{
		name: "Bratislavský kraj",
		logo: "logo-bk-farba.png",
		url: "https://bratislavskykraj.sk"
	},
	{
		name: "Mamateyka",
		logo: "mamateyka.png",
		url: "https://mamateyka.sk"
	},
	{
		name: "ProRate",
		logo: "ProRate.svg",
		url: "https://www.prorate.eu/sk/"
	},
	{
		name: "Stilus",
		logo: "stilus.svg",
		url: "https://www.stilus.sk/sk/"
	}
]

export default sponsors
