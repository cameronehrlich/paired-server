// core.js

// app config
var pairedApp = angular.module('pairedApp', []);

Parse.initialize("YM7X3UG99PpU1V65tceqlp9O4gJk9zXVrpbu4Pdl", "0ND7F8dl430jI6AR822WXjRH8cY1IUNA4lfrwdRZ");

// Controllers
var controllers = {};

controllers.UsersController = function ($scope) {

	init();

	function init () {
		$scope.users = [1,2,3,3,4];
		$scope.products = getProducts();
	}

	function getProducts() {
		
		var Product = Parse.Object.extend("Product");
		var query = new Parse.Query(Product);
		query.find({
			success: function (results) {
				console.log("retrieved objects from parse");
				$scope.products = results;
				$scope.$apply();
			},
			error: function (error) {
				console.log("There was an ERROR!");
			}
		});
	}

	$scope.addProduct = function(name, description) {

		$scope.name = "";
		$scope.description = "";
		var Product = Parse.Object.extend("Product");
		var newProduct = new Product();

		newProduct.save({name: name, description: description}).then(function(object) {
			$scope.products.push(object);
			$scope.$apply();
		});
	};

	$scope.deleteProduct = function (product) {
		var indexToRemove = $scope.products.indexOf(product);
		product.destroy({
			success: function (response) {
				$scope.products.splice(indexToRemove, 1);
				$scope.$apply();
			}
		});
	};
};

pairedApp.controller(controllers);
