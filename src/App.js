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
  constructor(props){
    super(props);
    this.state = {
      item:[],
      itemByRating: [],
      itemByMeta: [],
      AlertShow:false,
    };
  }

  loadData(){
    var self = this;
    axios({
      method: "get",
      url:"https://prod-61.westus.logic.azure.com:443/workflows/984d35048e064b61a0bf18ded384b6cf/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=6ZWKl4A16kST4vmDiWuEc94XI5CckbUH5gWqG-0gkAw" ,
      async: false,
      responseType: "json",
    })
      .then(function (response) {
        self.setState({ AlertShow: false });
        self.setState({item:response.data});
        var a = self.state.item.response.sort(function (a, b) {
          var x = a["rating"],
              y = b["rating"];
          return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        });
        self.setState({itemByRating:a});
        if(response.status===200){
          var peliculas=[];
          var b = self.state.itemByRating.sort(function (a, b) {
            var x = a["metascore"],
                y = b["metascore"];
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
          });
          b.forEach(function(valor){
            peliculas.push(valor.title);
          })
          console.log(b);
          console.log(peliculas);
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
    this.setState({itemByRating:[]});
  }


  render(){
    const buttonclean={
      float:'right'
    }
    return (
      <React.Fragment>
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand>Prueba para Envision</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              Creado por: <a>Bayron Ramírez Parada</a>
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
                      <Col xs={3} md={3} sm={6} xl={3}>
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
        <small className="text-muted">Metascore: {data.metascore}</small>
      </Card.Footer>
    </Card>

  </animated.div>
}

function Titulo(){
  return(
      <Jumbotron>
        <h1>Prueba Técnica Envision</h1>
        <p>
          Prueba realizada por Bayron Ramírez Parada, para Envision.
        </p>
        <p>
          <a href="https://github.com/Baldraxx/" target={"_blank"}>Ver mas...</a>
        </p>
      </Jumbotron>
  )
}


export default App;
