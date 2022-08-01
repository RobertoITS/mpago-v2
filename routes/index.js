var express = require('express');
const { app } = require('firebase-admin');
var router = express.Router();
var db = require('../config/firebase-config')
var mercadopago = require('mercadopago');
mercadopago.configurations.setAccessToken("TEST-5195066021992733-073114-bc76bf9a1232db75e73471a5602d017b-65060542");



/* GET home page. */
// ruta inicial, es asyncrona por que recoge datos de la base de datos

router.get('/', async function(req, res, next) {
    const request = await db.collection('runners').get();
    const { docs } = request;
    const runners = docs.map(runner => ({ id: runner.id, data: runner.data() }));
    res.render('index', { title: 'Mari Menuco Run', runners });
});

router.post('/process_payment', async function(req, res, next) {
    mercadopago.payment.save(req.body)
        .then(function(response) {
            const { status, status_detail, id } = response.body;
            res.status(response.status).json({ status, status_detail, id });
            console.log(response.status);
        })
        .catch(function(error) {
            console.error(error);
        });
});



/*POST ADD RUNNER*/
//esta ruta se ejecuta cuando hacemos click en el boton del formulario
// en la etiqueta form del html debemos incluirla en action asi:
// <form action="add-runner" method="post"> (no olvidar method post)
router.post('/add-runner', (req, res) => {
    // creamos objeto runner 
    const runner = {
        name: req.body.runnerName,
        age: req.body.runnerAge,
        email: req.body.runnerEmail,
        category: req.body.categories
    }

    db.collection('runners').add(runner); // grabamos datos en firebase

    // res.redirect('/') // para dirigirnos nuevamente a '/'

})

/*GET DELETE RUNNER*/
router.get('/borrar/:id', (req, res) => {
    let id = req.params.id;
    db.collection('runners').doc(id).delete();

    res.redirect('/') // para dirigirnos nuevamente a '/'    
})

/*GET RUNNER*/
router.get('/runner/:id', async(req, res) => {
    let id = req.params.id;
    const request = await db.collection('runners').doc(id).get();
    const runner = { id: id, data: request.data() }


    res.render('runner', { runner })
})



module.exports = router