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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
