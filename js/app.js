let app = angular.module('CarShopApp', ['ngRoute', 'CarModule', 'AccountModule', 'BidModule', 'angularUtils.directives.dirPagination', 'chart.js']);

app.config(['$routeProvider', '$locationProvider', 'ChartJsProvider',
	function ($routeProvider, $locationProvider, ChartJsProvider) {
		$routeProvider
			.when("/", {
				templateUrl: "views/car-list.html",
				controller: "carListController"
			})
			.when("/login/", {
				templateUrl: "views/login.html",
				controller: "loginController"
			})
			.when("/car/:carId", {
				templateUrl: "views/car-details.html",
				controller: "carDetailsController"
			})
			.when("/register/", {
				templateUrl: "views/register.html",
				controller: "registerController"
			})
			.when("/admin/:adminId", {
				templateUrl: "views/admin.html",
				controller: "adminController",
				resolve: {
					loggedIn: rejectIfNotLoggedIn
				}
			})
			.when("/newCar/", {
				templateUrl: "views/newCar.html",
				controller: "newCarController",
				resolve: {
					loggedIn: rejectIfNotLoggedIn
				}
			})
			.when("/updateCarList/", {
				templateUrl: "views/updateCarList.html",
				controller: "updateCarListController",
				resolve: {
					loggedIn: rejectIfNotLoggedIn
				}
			})
			.when("/updateCar/:carId", {
				templateUrl: "views/updateCar.html",
				controller: "updateCarController",
				resolve: {
					loggedIn: rejectIfNotLoggedIn
				}
			})
			.when("/charts/", {
				templateUrl: "views/chart.html",
				controller: "chartController",
				resolve: {
					loggedIn: rejectIfNotLoggedIn
				}
			})
			.when("/charts/:month", {
				templateUrl: "views/chartDay.html",
				controller: "chartDayController",
				resolve: {
					loggedIn: rejectIfNotLoggedIn
				}
			})
			.otherwise({
				redirectTo: "/"
			});
		ChartJsProvider.setOptions({
			chartColors: ['#FF5252', '#FF8A80'],
			responsive: false
		});

		$locationProvider.html5Mode(true);
	}
]);

app.run(function ($rootScope) {
	$rootScope.isLoggedIn = checkIfLoggedIn();
	$rootScope.isAdmin = checkIfAdmin();
	$rootScope.userId = getUserId();
	$rootScope.username = getUsername();
});

//controllers
app.controller('carListController', ['$scope', 'CarService',
	function ($scope, CarService) {
		$scope.data = CarService;
		$scope.sortType = 'id';
		$scope.sortReverse = false;
		$scope.cars = null;
		$scope.test = null;

		activate();

		function activate() {
			CarService.getCars().then(function (result) {
				$scope.cars = result.data.filter(function (car) {
					CarService.getBidsOnCar(car.id)
						.then(function (bidResult) {
							let highestObj = getMax(bidResult.data, "bidPrice");
							if (highestObj != null) {
								car.highestBid = (highestObj.bidPrice > car.bidPrice ? car.bidPrice : highestObj.bidPrice);
							}else{
								car.highestBid = 0;
							}
						});
					return car.sold !== true;
				});
			});
		}
	}
]);

app.controller('carDetailsController', ['$scope', '$routeParams', 'CarService', 'BidService',
	function ($scope, $routeParams, CarService, BidService) {
		$scope.data = CarService;
		$scope.dataBid = BidService;

		$scope.car = null;
		$scope.bids = null;
		$scope.sortType = 'bid';
		$scope.sortReverse = true;
		$scope.showBids = false;
		$scope.roles = null;

		activate();

		function activate() {
			let bids = null;
			CarService.getCarById($routeParams.carId)
				.then(function (result) {
					$scope.car = result.data;
				});

			CarService.getBidsOnCar($routeParams.carId)
				.then(function (result) {
					$scope.bids = result.data;

					let highestObj = getMax(result.data, "bidPrice");
					$scope.highestBid = (highestObj.bidPrice > $scope.car.bidPrice ? $scope.car.bidPrice : highestObj.bidPrice);
				});
		}

	}
]);

app.controller('newCarController', ['$scope', '$location', 'CarService',
	function ($scope, $location, CarService) {
		$scope.data = CarService;
		$scope.car = null;
		$scope.selectYear = [];

		$scope.newCar = function () {
			let user = getUserId();
			CarService.createCar($scope.car, user)
				.then(function () {
					$location.path("/");
				});
		};

		activate();

		function activate() {
			let date = new Date();
			let year = date.getFullYear();
			let years = [];
			for (let i = 0; i <= 100; i++) {
				years.push(year - i);
			}
			$scope.selectYear = years;
		}
	}
]);

app.controller('updateCarController', ['$scope', '$location', '$routeParams', 'CarService', 'AccountService',
	function ($scope, $location, $routeParams, CarService, AccountService) {
		$scope.data = CarService;
		$scope.dataAccount = AccountService;
		$scope.car = null;

		$scope.updateCar = function () {
			CarService.updateCar($scope.car)
				.then(function () {
					$location.path("/");
				});
		};

		activate();

		function activate() {
			let date = new Date();
			let year = date.getFullYear();
			let years = [];
			for (let i = 0; i <= 100; i++) {
				years.push(year - i);
			}
			$scope.selectYear = years;

			CarService.getCarById($routeParams.carId)
				.then(function (result) {
					$scope.car = result.data;
				});
		}
	}
]);

app.controller('updateCarListController', ['$scope', 'CarService',
	function ($scope, CarService) {
		$scope.data = CarService;

		activate();

		function activate() {
			CarService.getCars().then(function (result) {
				$scope.cars = result.data.filter(function (car) {
					return (car.sellerId.toString() === getUserId());
				});
			});
		}
	}
]);

app.controller('registerController', ['$scope', '$location', 'AccountService',
	function ($scope, $location, AccountService) {
		$scope.data = AccountService;

		$scope.registerUser = function () {
			// $scope.user.roleId = 3; //Buyer
			// $scope.user.roleId = 2; //Seller
			AccountService.registerUser($scope.user)
				.then(function () {
					showMessage("User Registred");
					$location.path("/");
				});
		};
	}
]);

app.controller('loginController', ['$scope', '$location', 'AccountService',
	function ($scope, $location, AccountService) {
		$scope.data = AccountService;

		$scope.loginUser = function () {
			AccountService.login($scope.user)
				.then(function (result) {
					$location.path("/");
				});
		};

		$scope.logoutUser = function () {
			AccountService.logout()
				.then(function () {
					$location.path("/");
				});
		};
	}
]);

app.controller('bidController', ['$scope', '$location', 'CarService', 'AccountService', 'BidService', '$route',
	function ($scope, $location, CarService, AccountService, BidService, $route) {
		$scope.data = AccountService;
		$scope.dataCar = CarService;
		$scope.dataBid = BidService;
		$scope.user = null;

		$scope.buyout = function (carId) {
			CarService.getCarById(carId)
				.then(function (result) {
					let bid = {
						bidderId: getUserId(),
						bidPrice: result.data.price,
						carId: carId
					};
					BidService.insertBid(bid)
						.then(function () {
							CarService.getBidsOnCar(bid.carId)
								.then(function (result) {
									$location.path("/");
									$route.reload();
								});
						});

				});
		}

		$scope.bidOnCar = function () {
			let bid = {
				bidderId: getUserId(),
				bidPrice: $scope.bidPrice,
				carId: $scope.car.id
			};

			BidService.insertBid(bid)
				.then(function () {
					CarService.getBidsOnCar(bid.carId)
						.then(function (result) {
							$location.path("/car/" + bid.carId);
							$route.reload();
						});
				});
		};
	}
]);

app.controller('chartController', ['$scope', '$window', 'BidService', 'CarService', 'ChartJs',
	function ($scope, $window, BidService, CarService, ChartJs) {
		$scope.data = BidService;
		$scope.dataCar = CarService;

		$scope.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		$scope.chartData = [];

		$scope.onClick = function (points) {
			$window.location.href = "/charts/" + points[0]._index;
		};

		yearChart();

		function yearChart() {
			let chartData = [];
			CarService.getCars().then(function (result) {
				let soldCars = result.data.filter(function (car) {
					return car.sold === true;
				});

				for (let month in $scope.months) {
					let sum = 0;

					// TODO: next line for only live data!
					sum = Math.floor(Math.random() * 100000000) + 1;

					let monthCars = soldCars.filter(function (car) {
						let soldMonth = new Date(car.soldDate).getMonth();
						if (soldMonth === parseInt(month)) {
							sum += car.soldPrice;
						}
					});

					chartData.push(sum);
				}
			});
			$scope.chartData.push(chartData);
		}

	}
]);

app.controller('chartDayController', ['$scope', '$routeParams', '$window', 'BidService', 'CarService', 'ChartJs',
	function ($scope, $routeParams, $window, BidService, CarService, ChartJs) {
		$scope.data = BidService;
		$scope.dataCar = CarService;

		$scope.days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
		$scope.chartData = [];

		$scope.onClick = function (points) {
			$window.location.href = "/charts/";
		};

		monthChart();

		function monthChart() {
			let chartData = [];
			CarService.getCars().then(function (result) {
				let soldCars = result.data.filter(function (car) {
					let soldMonth = new Date(car.soldDate).getMonth();
					return (car.sold === true && soldMonth === parseInt($routeParams.month));
				});
				console.log(soldCars);
				for (let day in $scope.days) {
					let sum = 0;

					// TODO: next line for only live data!
					sum = Math.floor(Math.random() * 100000000) + 1;

					let daysCars = soldCars.filter(function (car) {
						let soldDay = new Date(car.soldDate).getDate();

						if (soldDay === (parseInt(day) + 1)) {
							sum += car.soldPrice;
						}
					});
					chartData.push(sum);
				}
			});
			$scope.chartData.push(chartData);
		}
	}
]);

//directives
app.directive("compareTo", function () {
	return {
		require: "ngModel",
		scope: {
			otherModelValue: "=compareTo"
		},
		link: function (scope, element, attributes, ngModel) {

			ngModel.$validators.compareTo = function (modelValue) {
				return modelValue == scope.otherModelValue;
			};

			scope.$watch("otherModelValue", function () {
				ngModel.$validate();
			});
		}
	}
});

//functions
function checkIfLoggedIn() {
	return (localStorage.getItem("token") !== null);
}

function checkIfAdmin() {
	return (localStorage.getItem("role") === "seller");
}

function getUserId() {
	return localStorage.getItem("userId");
}

function getUsername() {
	return localStorage.getItem("username");
}

function getMax(arr, prop) {
	let max;
	for (let i = 0; i < arr.length; i++) {
		if (!max || parseInt(arr[i][prop]) > parseInt(max[prop]))
			max = arr[i];
	}
	return max;
}

function rejectIfNotLoggedIn($location) {
	if (checkIfLoggedIn()) return true;
	else $location.url('/login');
};

function showErrorMessage(message) {
	$("#failedText").show();
	$("#failedText").html(message).delay(3000).fadeOut();
}

function showMessage(message) {
	$("#confirmText").show();
	$("#confirmText").html(message).delay(3000).fadeOut();
}