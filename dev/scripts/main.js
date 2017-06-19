const foodApp = {};
foodApp.apiKey = 'c6a456b06c87490207e4863b23095a4a';
foodApp.apiId = '34cb1a7b';
foodApp.url = 'http://api.yummly.com/v1/api/recipes';
foodApp.zomatoApiKey = '23aee9d715bb14b28760a718dbd7453b';

foodApp.init = function() {
	foodApp.getUserData();
	foodApp.events();
};

foodApp.getUserData = function() {
	$('.userInputs').on('submit', (e) => {
		e.preventDefault();
		$('.recipesContainer').append('<p class="loading">Loading...</p>');
		let userFood = $('input[name="food"]').val();
		foodApp.userIngredients = $('input[name="ingredients"]').val().split(',');
		foodApp.userIngredients = foodApp.userIngredients.map(function(item) {
			return item.toLowerCase().trim();
		});
		foodApp.getRecipes(userFood);
	});
};

foodApp.getRecipes = function(userFood) {
	$.ajax({
		url: foodApp.url,
		method: 'GET',
		dataType: 'jsonp',
		data: {
			_app_key: foodApp.apiKey,
			_app_id: foodApp.apiId,
			q: userFood, 
			requirePictures: true,
			allowedIngredient: foodApp.userIngredients
		}
	})
	.then((recipeData) => {
		foodApp.filterRecipes(recipeData.matches);
	});
};

// need to compare user ingredients with api data ingredients before displaying on html
foodApp.filterRecipes = function(recipeMatches) {
	// get the difference between the length of the user ingredient array with recipeMatch ingredient length
	// use map to return new recipes with a new property called difference with the differentLength value
	// then if difference is <= 9 return a new list of recipes
	// sort recipe matches from lowest difference to highest difference
	const relevantRecipeMatches = recipeMatches.map((recipeMatch) => {
		const differenceLength = recipeMatch.ingredients.length - foodApp.userIngredients.length;
		return {
			recipe: recipeMatch,
			difference: differenceLength
		}
	})
	.filter((recipe) => recipe.difference <= 9)
	.sort((prev, curr) => {
		return prev.difference - curr.difference
	});
	$('.recipesContainer').html('');
	foodApp.displayRecipes(relevantRecipeMatches);
};

// take each filtered recipes and display on page
foodApp.displayRecipes = function(filteredRecipes) {
	$('.recipesContainer').empty();
	$('.grid-item').remove();
	filteredRecipes.forEach((filteredRecipe) => {
		const imageUrl = filteredRecipe.recipe.smallImageUrls[0].replace('=s90', '');
		const recipeMatch = $('<div>').addClass('recipeMatch'); // for packery
		const recipeImage = $('<div>')
									.addClass('recipeImage')
									.css('background-image', `url(${imageUrl})`);
		const foodImage = $('<img>').attr('src', imageUrl)
		const infoBox = $('<div>').addClass('infoBox')
		const recipeName = $('<h3>').text(filteredRecipe.recipe.recipeName);
		const recipeDetails = $('<button>').text('See Recipe').data('id', filteredRecipe.recipe.id);
		infoBox.append(recipeName, recipeDetails)
		recipeMatch.append(recipeImage, infoBox);

		if (filteredRecipe.difference !== 0) {
			const recipeDifference = $('<p>').text(`Only missing ${filteredRecipe.difference} ingredients!`);
			infoBox.append(recipeDifference);
		}
		$('.recipesContainer').append(recipeMatch);

	});

	if (filteredRecipes.length === 0) {
		const noMatches = $('<h2>').text('Sorry no matches!');
		$('.recipesContainer').append(noMatches);
	}
};

// get id from each matched recipe to use for next ajax request
foodApp.events = function() {
	$('.recipesContainer').on('click tap', 'button', function() {
		const clickedRecipe = $(this).data();
		foodApp.getRecipeData(clickedRecipe.id);
		$('body').addClass('modalOpen');
	});
	$('.recipesContainer').on('click tap', '.closeButton', function() {
	        $('.singleRecipeBackground').remove();
	        $('body').removeClass('modalOpen');
	});
};

// get more info for single recipe
foodApp.getRecipeData = function(recipeId) {
	$.ajax({
		url: `http://api.yummly.com/v1/api/recipe/${recipeId}`,
		method: 'GET',
		dataType: 'jsonp',
		data: {
			_app_key: foodApp.apiKey,
			_app_id: foodApp.apiId
		}
	}).then((recipe) => {
		foodApp.displaySingleRecipe(recipe);
	});
};

// show the yummly recipe page ON SAME PAGE
foodApp.displaySingleRecipe = function(recipe) {
	const singleRecipeBackground = $('<div>').addClass('singleRecipeBackground');
	const singleRecipeContainer = $('<div>').addClass('singleRecipeContainer');
	const singleRecipeFlex = $('<div>').addClass('singleRecipeFlex');
	const closeButton = $('<a>').attr('src', 'index.html')
											.append($(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 30" version="1.1" x="0px" y="0px"><title>21 -Cookie- (Solid)</title><desc>Created with Sketch.</desc><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g fill="#CD5C5C"><path d="M14.0024,16.0001 C13.4514,16.0001 13.0024,16.4491 13.0024,17.0001 C13.0024,17.5511 13.4514,18.0001 14.0024,18.0001 C14.5534,18.0001 15.0024,17.5511 15.0024,17.0001 C15.0024,16.4491 14.5534,16.0001 14.0024,16.0001"/><path d="M7.0024,10.0001 C6.4514,10.0001 6.0024,10.4491 6.0024,11.0001 C6.0024,11.5511 6.4514,12.0001 7.0024,12.0001 C7.5534,12.0001 8.0024,11.5511 8.0024,11.0001 C8.0024,10.4491 7.5534,10.0001 7.0024,10.0001"/><path d="M14.0024,20.0001 C12.3484,20.0001 11.0024,18.6541 11.0024,17.0001 C11.0024,15.3461 12.3484,14.0001 14.0024,14.0001 C15.6564,14.0001 17.0024,15.3461 17.0024,17.0001 C17.0024,18.6541 15.6564,20.0001 14.0024,20.0001 M7.0024,14.0001 C5.3484,14.0001 4.0024,12.6541 4.0024,11.0001 C4.0024,9.3461 5.3484,8.0001 7.0024,8.0001 C8.6564,8.0001 10.0024,9.3461 10.0024,11.0001 C10.0024,12.6541 8.6564,14.0001 7.0024,14.0001 M23.6054,12.1091 C23.3594,11.9021 23.0314,11.8251 22.7184,11.9011 C22.4464,11.9691 22.2194,12.0001 22.0024,12.0001 C20.3484,12.0001 19.0024,10.6541 19.0024,9.0001 C19.0024,8.7241 19.0524,8.4371 19.1604,8.0981 C19.2734,7.7421 19.1784,7.3521 18.9144,7.0881 C18.6504,6.8231 18.2614,6.7291 17.9044,6.8421 C17.5644,6.9501 17.2784,7.0001 17.0024,7.0001 C15.3484,7.0001 14.0024,5.6541 14.0024,4.0001 C14.0024,3.2171 14.3064,2.4751 14.8564,1.9101 C15.1134,1.6461 15.2054,1.2651 15.0954,0.9141 C14.9864,0.5631 14.6944,0.3011 14.3344,0.2301 C13.5574,0.0781 12.7734,0.0001 12.0024,0.0001 C5.3854,0.0001 0.0024,5.3831 0.0024,12.0001 C0.0024,18.6171 5.3854,24.0001 12.0024,24.0001 C18.2174,24.0001 23.4674,19.1461 23.9554,12.9511 C23.9804,12.6301 23.8504,12.3171 23.6054,12.1091"/><path d="M14.0024,16.0001 C13.4514,16.0001 13.0024,16.4491 13.0024,17.0001 C13.0024,17.5511 13.4514,18.0001 14.0024,18.0001 C14.5534,18.0001 15.0024,17.5511 15.0024,17.0001 C15.0024,16.4491 14.5534,16.0001 14.0024,16.0001"/><path d="M7.0024,10.0001 C6.4514,10.0001 6.0024,10.4491 6.0024,11.0001 C6.0024,11.5511 6.4514,12.0001 7.0024,12.0001 C7.5534,12.0001 8.0024,11.5511 8.0024,11.0001 C8.0024,10.4491 7.5534,10.0001 7.0024,10.0001"/><path d="M14.0024,20.0001 C12.3484,20.0001 11.0024,18.6541 11.0024,17.0001 C11.0024,15.3461 12.3484,14.0001 14.0024,14.0001 C15.6564,14.0001 17.0024,15.3461 17.0024,17.0001 C17.0024,18.6541 15.6564,20.0001 14.0024,20.0001 M7.0024,14.0001 C5.3484,14.0001 4.0024,12.6541 4.0024,11.0001 C4.0024,9.3461 5.3484,8.0001 7.0024,8.0001 C8.6564,8.0001 10.0024,9.3461 10.0024,11.0001 C10.0024,12.6541 8.6564,14.0001 7.0024,14.0001 M23.6054,12.1091 C23.3594,11.9021 23.0314,11.8251 22.7184,11.9011 C22.4464,11.9691 22.2194,12.0001 22.0024,12.0001 C20.3484,12.0001 19.0024,10.6541 19.0024,9.0001 C19.0024,8.7241 19.0524,8.4371 19.1604,8.0981 C19.2734,7.7421 19.1784,7.3521 18.9144,7.0881 C18.6504,6.8231 18.2614,6.7291 17.9044,6.8421 C17.5644,6.9501 17.2784,7.0001 17.0024,7.0001 C15.3484,7.0001 14.0024,5.6541 14.0024,4.0001 C14.0024,3.2171 14.3064,2.4751 14.8564,1.9101 C15.1134,1.6461 15.2054,1.2651 15.0954,0.9141 C14.9864,0.5631 14.6944,0.3011 14.3344,0.2301 C13.5574,0.0781 12.7734,0.0001 12.0024,0.0001 C5.3854,0.0001 0.0024,5.3831 0.0024,12.0001 C0.0024,18.6171 5.3854,24.0001 12.0024,24.0001 C18.2174,24.0001 23.4674,19.1461 23.9554,12.9511 C23.9804,12.6301 23.8504,12.3171 23.6054,12.1091"/></g></g><text x="0" y="39" fill="#000000" font-size="5px" font-weight="bold" font-family="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif">Created by Oliviu Stoian</text><text x="0" y="44" fill="#000000" font-size="5px" font-weight="bold" font-family="'Helvetica Neue', Helvetica, Arial-Unicode, Arial, Sans-serif">from the Noun Project</text></svg>`)) // cookie svg
											.addClass('closeButton');
	const recipeImageContainer = $('<div>').addClass('singleRecipeImage');
	const recipeImageUrl = recipe.images[0].hostedLargeUrl;
	const singleRecipeImage = $('<img>').attr('src', recipeImageUrl);
	const singleRecipeName = $('<h2>').text(`- ${recipe.name} -`);
	const prepTime = $('<p>').text(`Total time: ${recipe.totalTime}`);
	recipeImageContainer.append(singleRecipeImage, singleRecipeName);
	const ingredientContainer = $('<div>').addClass('ingredientContainer');
	const ingredientTitle = $('<h3>').text('Ingredients');
	const ingredientLine = $('<ul class="ingredientLine">')
	recipe.ingredientLines.forEach((ingredient) => {
		const singleIngredient = $('<li>').text(ingredient);
		ingredientLine.append(singleIngredient);
	});
	const recipeSource = $('<a>').attr('href', recipe.source.sourceRecipeUrl)
									.attr('target', '_blank')
									.text('Go to source');
	ingredientContainer.append(ingredientTitle, prepTime, ingredientLine, recipeSource)
	singleRecipeFlex.append(recipeImageContainer, ingredientContainer)
	singleRecipeContainer.append(closeButton, 
									singleRecipeFlex);
	singleRecipeBackground.append(singleRecipeContainer);
	$('.recipesContainer').append(singleRecipeBackground);
};

$(function() {
	foodApp.init();

});

