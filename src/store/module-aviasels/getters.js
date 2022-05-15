export const getAviasels = (state) => {
	return state["result"];
};
export const getMinPriceSortAviasels = (state) => (filterParametr) => {
	let arr = JSON.parse(JSON.stringify(state["result"].flights));

	if (filterParametr.groupFilter.find((elem) => elem === "oneTransfer")) {
		arr = arr.filter((elem) => elem.flight.legs[0].segments.length == 2);
	}
	if (filterParametr.groupFilter.find((elem) => elem === "withoutTransfer")) {
		arr = arr.filter((elem) => elem.flight.legs[0].segments.length == 1);
	}

	arr = arr.filter((elem) => +elem.flight.price.total.amount >= filterParametr.moneyMin);
	arr = arr.filter((elem) => +elem.flight.price.total.amount <= filterParametr.moneyMax);

	if (filterParametr.groupSort == "increasePrice") {
		arr.sort((a, b) => a.flight.price.total.amount - b.flight.price.total.amount);
	} else if (filterParametr.groupSort == "descendingPrice") {
		arr.sort((a, b) => b.flight.price.total.amount - a.flight.price.total.amount);
	} else if (filterParametr.groupSort == "travelTime") {
		arr.sort((a, b) => a.flight.legs[0].duration - b.flight.legs[0].duration);
	}

	const companyFilter = [];

	filterParametr.groupAirlines.forEach((airlines, index) => {
		companyFilter[index] = JSON.parse(
			JSON.stringify(arr.filter((elem) => elem.flight.carrier.airlineCode == airlines))
		);
	});

	companyFilter.forEach((array) => {
		arr = [];
		arr = arr.concat(array);
	});
	return arr;
};
