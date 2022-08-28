<template>
	<div class="row justify-around">
		<div class="q-pa-md fixed-top-left filter-block">
			<div>
				<span class="text-weight-bold">Сортировать</span>

				<q-option-group
					:options="optionSort"
					type="radio"
					v-model="groupSort"
					@update:model-value="getCurrentFlight"
				/>
			</div>
			<div>
				<span class="text-weight-bold">Фильтровать</span>
				<q-option-group
					:options="optionsFilter"
					type="checkbox"
					v-model="groupFilter"
					@update:model-value="getCurrentFlight"
				/>
			</div>
			<div>
				<span class="text-weight-bold">Цена</span>
				<q-input
					outlined
					v-model="moneyMin"
					type="number"
					:min="getMinPrice"
					:max="getMaxPrice"
					dense
					class="q-ma-xs"
					@update:model-value="getCurrentFlight"
				>
					<template v-slot:before> От </template>
				</q-input>
				<q-input
					outlined
					v-model="moneyMax"
					type="number"
					:min="getMinPrice"
					:max="getMaxPrice"
					dense
					class="q-ma-xs"
					@update:model-value="getCurrentFlight"
				>
					<template v-slot:before> До </template>
				</q-input>
			</div>
			<div>
				<span class="text-weight-bold">Авиакомпании</span>
				<q-option-group
					:options="optionsAirlines"
					type="checkbox"
					v-model="groupAirlines"
					@update:model-value="getCurrentFlight"
				/>
			</div>
		</div>

		<div class="column items-center justify-center" v-if="currentFlights.length !== 0">
			<div class="my-card q-ma-lg" v-for="(flight, indexFlight) in currentFlights" :key="indexFlight">
				<q-card>
					<q-card-section class="card_header bg-primary text-white row justify-between">
						<div>
							<q-img
								:src="getImgUrl(flight.flight.carrier.airlineCode)"
								alt="Пустота"
								style="max-height: 60px; min-width: 100px"
								no-spinner
								width="220px"
							/>
						</div>
						<div>
							<div class="text-h5 text-right">
								{{ flight.flight.price.total.amount }}
								<q-icon name="currency_ruble" size="22px" />
							</div>
							<div>Стоимость для одного взрослого пассажира</div>
						</div>
					</q-card-section>

					<q-card-section class="bg-white" v-for="(leg, index) in flight.flight.legs" :key="index">
						<div v-if="leg.segments.length == 2" class="text-h6">
							{{ leg.segments[0].departureCity?.caption }},
							{{ leg.segments[0].departureAirport?.caption }}
							<span class="text-primary"> ({{ leg.segments[0].departureAirport?.uid }}) </span>
							<q-icon name="arrow_right_alt" size="35px" />
							{{ leg.segments[1].arrivalCity?.caption }},
							{{ leg.segments[1].arrivalAirport?.caption }}
							<span class="text-primary">({{ leg.segments[1].arrivalAirport?.uid }})</span>
							<q-separator />
						</div>

						<div v-else-if="leg.segments.length == 1" class="text-h6">
							{{ leg.segments[0].departureCity.caption }},
							{{ leg.segments[0].departureAirport.caption }}
							<span class="text-primary">({{ leg.segments[0].departureAirport?.uid }})</span>
							<q-icon name="arrow_right_alt" size="35px" />
							{{ leg.segments[0].arrivalCity.caption }},
							{{ leg.segments[0].arrivalAirport.caption }}
							<span class="text-primary">({{ leg.segments[0].arrivalAirport?.uid }})</span>
							<q-separator />
						</div>

						<div v-if="leg.segments.length == 2" class="row justify-between q-my-sm">
							<div>
								<span class="text-h6 q-mr-sm">{{ getTimeFly(leg.segments[0].departureDate) }}</span>
								<span class="text-primary">{{ getDateFly(leg.segments[0].departureDate) }}</span>
							</div>
							<div class="row items-center">
								<q-icon name="query_builder" size="22px" />
								<span class="text-h6 q-ml-sm">{{ getDuration(leg.duration) }}</span>
							</div>

							<div>
								<span class="text-h6 q-mr-sm">{{ getTimeFly(leg.segments[1].arrivalDate) }}</span>
								<span class="text-primary">{{ getDateFly(leg.segments[1].arrivalDate) }}</span>
							</div>
						</div>

						<div v-else-if="leg.segments.length == 1" class="row justify-between q-my-sm">
							<div>
								<span class="text-h6 q-mr-sm">{{ getTimeFly(leg.segments[0].departureDate) }}</span>
								<span class="text-primary">{{ getDateFly(leg.segments[0].departureDate) }}</span>
							</div>
							<div class="row items-center">
								<q-icon name="query_builder" size="22px" />
								<span class="text-h6 q-ml-sm">{{ getDuration(leg.duration) }}</span>
							</div>
							<div>
								<span class="text-h6 q-mr-sm">{{ getTimeFly(leg.segments[0].arrivalDate) }}</span>
								<span class="text-primary">{{ getDateFly(leg.segments[0].arrivalDate) }}</span>
							</div>
						</div>
						<div>
							<hr width="80%" class="text-center q-my-md" />
							<div
								class="transfer absolute-center text-red bg-white q-px-xs"
								v-if="leg.segments.length > 1"
							>
								{{ leg.segments.length - 1 }} пересадка
							</div>
						</div>
						<div>рейс выполняет: {{ leg.segments[0].airline.caption }}</div>
					</q-card-section>

					<q-card-actions class="text-white text-uppercase text-h6 row justify-center chose-fligth">
						Выбрать
					</q-card-actions>
				</q-card>
			</div>
			<q-btn class="q-ma-lg" label="показать еще" @click="showMoreFlight" />
		</div>
	</div>
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex";

export default {
	setup() {
		const store = useStore();
		const getMinPriceSortAviasels = computed(() => store.getters["aviasels/getMinPriceSortAviasels"]);
		const getMaxPrice = computed(() => store.getters["aviasels/getMaxPrice"]);
		const getMinPrice = computed(() => store.getters["aviasels/getMinPrice"]);
		const currentFlights = ref([]);
		const optionSort = [
			{ label: " - по возврастанию цены", value: "increasePrice" },
			{ label: " - по убыванию цены", value: "descendingPrice" },
			{ label: " - по времени в пути", value: "travelTime" },
		];
		const groupSort = ref("increasePrice");
		const optionsFilter = [
			{ label: " - 1 пересадка", value: "oneTransfer" },
			{ label: " - без пересадок", value: "withoutTransfer" },
		];
		const groupFilter = ref([]);
		const moneyMin = ref(getMinPrice.value);
		const moneyMax = ref(getMaxPrice.value);

		const groupAirlines = ref([]);

		const getCurrentFlight = () => {
			currentFlights.value = [];
			if (
				getMinPriceSortAviasels.value({
					groupSort: groupSort.value,
					groupFilter: groupFilter.value,
					moneyMin: moneyMin.value,
					moneyMax: moneyMax.value,
					groupAirlines: groupAirlines.value,
				}).length !== 0
			) {
				currentFlights.value.push(
					getMinPriceSortAviasels.value({
						groupSort: groupSort.value,
						groupFilter: groupFilter.value,
						moneyMin: moneyMin.value,
						moneyMax: moneyMax.value,
						groupAirlines: groupAirlines.value,
					})[0]
				);
				currentFlights.value.push(
					getMinPriceSortAviasels.value({
						groupSort: groupSort.value,
						groupFilter: groupFilter.value,
						moneyMin: moneyMin.value,
						moneyMax: moneyMax.value,
						groupAirlines: groupAirlines.value,
					})[1]
				);
			}
		};
		getCurrentFlight();

		const getImgUrl = (imgAirlineCode) => {
			let images;
			try {
				images = require("../../assets/" + imgAirlineCode + ".svg");
			} catch (error) {
				try {
					images = require("../../assets/" + imgAirlineCode + ".png");
				} catch (err) {
					images = require("../../assets/" + "LOGO" + ".png");
				}
			}
			return images;
		};

		const getTimeFly = (date) => {
			let currentTime = new Date(date);
			let hour = currentTime.getHours();
			if (hour < 10) {
				hour = "0" + hour;
			}
			let minutes = currentTime.getMinutes();
			if (minutes < 10) {
				minutes = "0" + minutes;
			}
			return hour + ":" + minutes;
		};

		const getDateFly = (date) => {
			let currentDate = new Date(date);
			let month = (i) => {
				const months = [
					"янв.",
					"февр.",
					"март",
					"апр.",
					"май",
					"июнь",
					"июль",
					"авг.",
					"сент.",
					"окт.",
					"нояб.",
					"дек.",
				];
				return months[i];
			};
			let day = (i) => {
				const days = ["воскр.", "пон.", "вт", "ср.", "четв", "пят", "субб"];
				return days[i];
			};
			return currentDate.getDate() + ", " + month(currentDate.getMonth()) + " " + day(currentDate.getDay());
		};

		const getDuration = (duration) => {
			let hours = Math.trunc(duration / 60);
			if (hours < 10) {
				hours = "0" + hours;
			}
			let minutes = duration % 60;
			if (minutes < 10) {
				minutes = "0" + minutes;
			}
			return hours + " ч " + minutes + " мин";
		};

		const showMoreFlight = () => {
			try {
				if (
					currentFlights.value.length <
					getMinPriceSortAviasels.value({
						groupSort: groupSort.value,
						groupFilter: groupFilter.value,
						moneyMin: moneyMin.value,
						moneyMax: moneyMax.value,
						groupAirlines: groupAirlines.value,
					}).length
				) {
					currentFlights.value.push(
						getMinPriceSortAviasels.value({
							groupSort: groupSort.value,
							groupFilter: groupFilter.value,
							moneyMin: moneyMin.value,
							moneyMax: moneyMax.value,
							groupAirlines: groupAirlines.value,
						})[currentFlights.value.length]
					);
					currentFlights.value.push(
						getMinPriceSortAviasels.value({
							groupSort: groupSort.value,
							groupFilter: groupFilter.value,
							moneyMin: moneyMin.value,
							moneyMax: moneyMax.value,
							groupAirlines: groupAirlines.value,
						})[currentFlights.value.length]
					);
				}
			} catch (err) {
				console.log(err);
			}
		};

		const optionsAirlines = computed(() => store.getters["aviasels/getAllAirlines"]);
		return {
			getImgUrl,
			currentFlights,
			getTimeFly,
			getDateFly,
			getDuration,
			showMoreFlight,
			optionSort,
			groupSort,
			optionsFilter,
			groupFilter,
			getCurrentFlight,
			moneyMin,
			moneyMax,
			optionsAirlines,
			groupAirlines,
			getMaxPrice,
			getMinPrice,
		};
	},
};
</script>

<style lang="sass" scoped>
.filter-block
	width: 240px
	background-color: #ddd
	& div
		width: 100%
		white-space: nowrap
		overflow: hidden
		text-overflow: ellipsis

.my-card
	width: 100%
	font-size: 16px


.chose-fligth
	cursor: pointer
	background-color: #ffaa00
	&:hover
		background-color: #ffbb00

.transfer
	top: 65%
</style>
