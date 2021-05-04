import React, { useState } from "react";
import {
  Card,
  Button,
  Alert,
  Container,
  Row,
  Col,
  Navbar,
  Jumbotron
} from "react-bootstrap";
import axios from "axios";
import { useSpring, animated } from 'react-spring';
import './App.css';
import imagen from "./assets/imagenes";

//clase principal
class App extends React.Component{
  //contructor base
  constructor(props){
    super(props);
    var meses=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    var today = new Date(),
        date =   today.getDate()+ '-' + meses[today.getMonth()] + '-' + today.getFullYear();
    this.state = {
      item:[],
      itemByRating: [],
      itemByMeta: [],
      AlertShow:false,
      FechaActual:date
    };
  }

  //function de carga de Peliculas
  loadData(){
    var self = this;
    axios({
      method: "get",
      url:"https://prod-61.westus.logic.azure.com:443/workflows/984d35048e064b61a0bf18ded384b6cf/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=6ZWKl4A16kST4vmDiWuEc94XI5CckbUH5gWqG-0gkAw" ,
      async: false,
      responseType: "json",
    })
      .then(function (response) {
        //oculta la alerta si esta en pantalla
        self.setState({ AlertShow: false });
        //guarda data obtenida
        self.setState({item:response.data});
        //reoordena la data por "rating" y crea nuevo objeto
        var a = self.state.item.response.sort(function (a, b) {
          var x = a["rating"],
              y = b["rating"];
          return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        });
        //guarda la data ordenada
        self.setState({itemByRating:a});
        //si el status de la peticion es 200
        if(response.status===200){
          //crea arreglo de peliculas
          var peliculas=[];
          //ordena la data previamente procesada, ahora por "metascore" y crea nuevo objeto
          var b = self.state.itemByRating.sort(function (a, b) {
            var x = a["metascore"],
                y = b["metascore"];
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
          });
          //busca los titulos y los guarda de arreglo
          b.forEach(function(valor){
            peliculas.push(valor.title);
          })
          //envia datos de rut y peliculas
          axios({
            method: "post",
            url:"https://prod-62.westus.logic.azure.com:443/workflows/779069c026094a32bb8a18428b086b2c/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=o_zIF50Dd_EpozYSPSZ6cWB5BRQc3iERfgS0m-4gXUo" ,
            async: false,
            responseType: "json",
            data:{
              "RUT":"17668447-K",
              "Peliculas":peliculas
            }
          }).then(function(nResponse){
            //en consola, muestra el status de la peticion
            console.log("Status Enviado: "+nResponse.status)
          })
        }
      })
      .catch(function (error) {
        //en caso de error
        //muestra mensaje de alerta
        self.setState({ AlertShow: true });
      });
  }

  clearList(){
    //limpia el listado de peliculas dejandolo vacio
    this.setState({itemByRating:[]});
  }


  render(){
    //estilos de boton "limpiar"
    const buttonclean={
      float:'right'
    }
    return (
      <React.Fragment>
        <Navbar sticky={'top'} bg="dark" variant="dark">
          <Navbar.Brand>Prueba para Envision</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              Creado por: <a>Bayron Ramírez Parada</a>
            </Navbar.Text>
          </Navbar.Collapse>
        </Navbar>
        <Navbar fixed={'bottom'} bg="dark" variant="dark">
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              Hoy es: <a>{this.state.FechaActual}</a>
            </Navbar.Text>
          </Navbar.Collapse>
        </Navbar>
        <Titulo/>
        <br/>
        <Container>
          <Alert
              variant="danger"
              show={this.state.AlertShow}
          >
            Error al obtener la data!
          </Alert>
          <Row>
            <Col xs={12} md={12}>
              <Card >
                <Card.Header>
                  Lista de Exitos de IMDB por Rating
                  <Button onClick={() => this.clearList()} variant="outline-primary rigth" size={'sm'} style={buttonclean}>Limpiar</Button>
                </Card.Header>
                <Card.Body>
                  <Button onClick={() => this.loadData()} variant="outline-primary" size={'lg'}>Cargar Lista de Peliculas</Button>
                  <br/><br/>
                  <Row>
                  {this.state.itemByRating.map((i,index) => (
                      <Col xl={3} xs={12} md={6} sm={6} >
                        <Pelicula data={i} index={index+1} />
                      </Col>
                  ))}
                  </Row>
                </Card.Body>
                <Card.Footer>

                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Container>
        <br/>
      </React.Fragment>
    );
  }
}
//funcion que carga las cartas de las peliculas
function Pelicula(props) {
  const [data, setData] = useState(props.data);
  const [index, setIndex] = useState(props.index);
  const delaydiv=500*index;
  const styles = useSpring({
    to: { opacity: 1,x:0 },
    from: { opacity: 0,x:100 },
    delay:delaydiv
  });

  const titulo=data.title.replace(/\W/g, "");

  const cardStyle={
    margin:"10px"
  };
  const imgstyle = {
    Width: "100%",
    maxheight: "50%",
    minheight: "50%",
  };
  const bodystyle={
    height:"150px"
  };
  return <animated.div style={styles}>
    <Card style={cardStyle}>
      <Card.Img variant="top" style={imgstyle} src={imagen[titulo]} />
      <Card.Body style={bodystyle}>
        <Card.Title>{index}°: {data.title} ({data.year})</Card.Title>
        <Card.Text>
          Director: {data.director}
        </Card.Text>
      </Card.Body>
      <Card.Footer>
        <small className="text-muted"><b>Metascore:</b> {data.metascore} & <b>Rating:</b> {data.rating}</small>
      </Card.Footer>
    </Card>

  </animated.div>
}
//funcion que carga la seccion de Titulo
function Titulo(){
  const styles = useSpring({
    to: { opacity: 1,x:0 },
    from: { opacity: 0,x:500 },
  });

  return(
      <Jumbotron>
        <animated.div style={styles}>
          <h1>Prueba Técnica Envision</h1>
          <p>
            Prueba realizada por Bayron Ramírez Parada, para Envision.
          </p>
          <Button variant="primary" href="https://github.com/Baldraxx/Prueba-envision" target={"_blank"}>
            Ver mas...
          </Button>
        </animated.div>
      </Jumbotron>
  )
}


export default App;
