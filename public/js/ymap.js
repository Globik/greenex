ymaps.ready(function () {

	if (window.myRouteData == undefined) {
		return false;
	}

	// console.log(myRouteData);
	// console.log(myRouteOptions);

	myMap = new ymaps.Map("map", {
		center: [myRouteData[0].lat, myRouteData[0].lng],
		zoom: 10,
		controls: ['typeSelector', 'fullscreenControl', 'zoomControl', 'rulerControl']
	}, {
		//searchControlProvider: 'yandex#search'
	});

	myMap.geoObjects
		.add(new ymaps.Placemark([myRouteData[0].lat, myRouteData[0].lng], {
			iconContent: myRouteData[0].name,
		}, {
			preset: 'islands#blueStretchyIcon'
		}))
		.add(new ymaps.Placemark([myRouteData[1].lat, myRouteData[1].lng], {
			iconContent: myRouteData[1].name,
		}, {
			preset: 'islands#redStretchyIcon'
		}));

	if (myRouteOptions.drawRpute) {
		multiRoute = new ymaps.multiRouter.MultiRoute({
			referencePoints: [
				[myRouteData[0].lat, myRouteData[0].lng],
				[myRouteData[1].lat, myRouteData[1].lng]
			],
			params: {
				results: 1,
				routingMode: myRouteOptions.routeType,
			}
		}, {
			boundsAutoApply: true,
			wayPointVisible: false
		});
		myMap.geoObjects.add(multiRoute);
	}

	if (myRouteOptions.needDrawLine) {
		var myLinePolyline = new ymaps.Polyline([
			[myRouteData[0].lat, myRouteData[0].lng],
			[myRouteData[1].lat, myRouteData[1].lng]
		], {
			hintContent: "По прямой"
		}, {
			draggable: true,
			strokeColor: '#ff9900',
			strokeWidth: 4,
			strokeStyle: '4 2'
		});
		myMap.geoObjects.add(myLinePolyline);
	}
	if (myRouteOptions.needDistance) {
		// Вариант 1 (определяет по прямой)
		/* var myDistance = ymaps.coordSystem.geo.getDistance(
			[myRouteData[0].lat, myRouteData[0].lng],
			[myRouteData[1].lat, myRouteData[1].lng]
		);
		myDistance = parseInt(myDistance);
		alert(Math.round(myDistance / 1000)); */
		// Вариант 2
		ymaps.route([
			[myRouteData[0].lat, myRouteData[0].lng],
			[myRouteData[1].lat, myRouteData[1].lng]
		], {
			//mapStateAutoApply: true
		}).then(function (router) {
				var myDistance = (Math.round(router.getLength() / 1000)) + ' км.';
				//var myDistance = router.getHumanLength();
				var elDistance = document.getElementsByClassName('distance');
				for (let i = 0; i < elDistance.length; ++i) elDistance[i].innerHTML = myDistance;
				var myDuration = router.getHumanTime();
				var elDuration = document.getElementsByClassName('duration');
				for (let i = 0; i < elDuration.length; ++i) elDuration[i].innerHTML = myDuration;
			},
			function (error) {
				console.log("Возникла ошибка: " + error.message);
			});
		return false;
		// Вариант 3 (по названияю городов)
		/* ymaps.geocode(myRouteData[0].name).then(function (res) {
			var moscowCoords = res.geoObjects.get(0).geometry.getCoordinates();
			// Координаты Нью-Йорка
			ymaps.geocode(myRouteData[1].name).then(function (res) {
				var newYorkCoords = res.geoObjects.get(0).geometry.getCoordinates();
				// Расстояние
				alert(ymaps.formatter.distance(
					ymaps.coordSystem.geo.getDistance(moscowCoords, newYorkCoords)
				));
			});
		}); */
	}

});