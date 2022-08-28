export const getAviasels = (state) => {
	return state["result"];
};
export const getMinPriceSortAviasels =
	(state) =>
	({ groupSort, groupFilter, moneyMin, moneyMax, groupAirlines }) => {
		let arr = JSON.parse(JSON.stringify(state["result"].flights));

		const companyFilter = [];
		groupAirlines.forEach((airlines, index) => {
			companyFilter[index] = JSON.parse(
				JSON.stringify(arr.filter((elem) => elem.flight.carrier.airlineCode == airlines))
			);
		});
		if (companyFilter.length != 0) arr = [];
		companyFilter.forEach((array) => {
			arr = arr.concat(array);
		});

		if (groupFilter.find((elem) => elem === "oneTransfer")) {
			arr = arr.filter((elem) => {
				let bool = false;
				elem.flight.legs.forEach((leg) => {
					bool = bool || leg.segments.length == 2;
					return bool;
				});
				return bool;
			});
		}
		if (groupFilter.find((elem) => elem === "withoutTransfer")) {
			arr = arr.filter((elem) => {
				let bool = true;
				elem.flight.legs.forEach((leg) => {
					bool = bool && leg.segments.length == 1;
					return bool;
				});
				return bool;
			});
		}

		arr = arr.filter((elem) => +elem.flight.price.total.amount >= moneyMin);
		arr = arr.filter((elem) => +elem.flight.price.total.amount <= moneyMax);

		if (groupSort == "increasePrice") {
			arr.sort((a, b) => a.flight.price.total.amount - b.flight.price.total.amount);
		} else if (groupSort == "descendingPrice") {
			arr.sort((a, b) => b.flight.price.total.amount - a.flight.price.total.amount);
		} else if (groupSort == "travelTime") {
			arr.sort((a, b) => a.flight.legs[0].duration - b.flight.legs[0].duration);
		}

		return arr;
	};

export const getMaxPrice = (state) => {
	let maxPrice = +state["result"].flights[0].flight.price.total.amount;
	state["result"].flights.forEach((currentFlight) => {
		maxPrice = Math.max(maxPrice, +currentFlight.flight.price.total.amount);
	});
	return maxPrice;
};
export const getMinPrice = (state) => {
	let minPrice = +state["result"].flights[0].flight.price.total.amount;
	state["result"].flights.forEach((currentFlight) => {
		minPrice = Math.min(minPrice, +currentFlight.flight.price.total.amount);
	});
	return minPrice;
};
export const getAllAirlines = (state) => {
	const allAirlines = [];
	state["result"].flights.forEach((flight) => {
		let airlineCode = flight.flight.carrier.airlineCode;
		let caption = flight.flight.carrier.caption;
		if (allAirlines.length !== 0) {
			if (allAirlines.find((elem) => elem.value == airlineCode) == undefined) {
				allAirlines.push({ value: airlineCode, label: caption });
			}
		} else {
			allAirlines.push({ value: airlineCode, label: caption });
		}
	});
	return allAirlines;
};
