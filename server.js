const express = require('express')
const axios=require('axios').default;
const app = express()
app.use(express.static('public'));
const port = 3000

app.get('/wp-content/themes/greenEx/php/calc.php', (req, res) => {
	console.log("QUERY: ", req.query);
	axios.get(`https://greenex.pro/wp-content/themes/greenEx/php/calc.php`, {params: req.query}).then(
	function(d){
		console.log("data: ",d.data)
		res.json(d.data)
		}).catch(function(er){
			console.log('err: ',er.toString())
			res.send(er.toString());
			})

  
})

let a = new Map();
a.set(1, {price: 1});
a.set(2, {price: 2});
a.set(3, {price: 3});
console.log("size: ", a.size);
let c = [];
a.forEach(function(el,i){
	c.push(el.price);
})
console.log("array: ", c)
let b = c.reduce(function(ac, v){
	
	var returns = ac + v;
	return returns;
}, 10)
console.log("total sum: ", b)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
