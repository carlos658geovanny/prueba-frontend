import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import endpoints from './util/constantes';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';


function App() {

  const [modal, setModal] = useState({
    active: false
  });

  const abrirModal = () => {
    setModal({
      active: !modal.active
    })
  }

  //ESTADO PARA OBTENER DATA DE RESPUESTA
  const [data, setData] = useState({});

  const [instituciones, setInstituciones] = useState([]);
  const [selectedInstitucion, setSelectedInstitucion] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(endpoints.catalogoInstituciones);
        setInstituciones(response.data);
      } catch (error) {
        console.error('Error al obtener las instituciones:', error);
      }
    };

    fetchData();
  }, []);

  const [identificationType, setIdentificationType] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [tipoCuenta, setTipoCuenta] = useState(1);
  const [numeroCuenta, setNumeroCuenta] = useState('');
  const [valorTransferencia, setValorTransferencia] = useState('');

  const [token, setToken] = useState('');

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.post('https://desarrollo.gti.fin.ec/boton-web-api-ws-1.0/coopagos/web/public/login', {
          usuario: endpoints.user,
          clave: endpoints.password,
        });

        if (response.status === 200) {
          setToken(response.data.token);
        } else {
          console.log("Erro al obtener el token: " + response.data.token);
        }
        console.log(response.data.token)
      } catch (error) {
        console.error('Error al obtener el token:', error);
      }
    };

    fetchToken();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const consumirServicioPrivado = async () => {
      try {
        const solicitud = {
          chanel: 'ELAKE',
          debitPerson: {
            institution: selectedInstitucion,
            identificationType: identificationType,
            identification: identificacion,
            accountType: tipoCuenta,
            account: numeroCuenta,
          },
          creditPerson: {
            institution: '2',
            identificationType: 'C',
            identification: '0102514106',
            accountType: 1,
            account: '100004',
          },
          amount: valorTransferencia,
          amountDelivery: 0.0,
          orderId: '1',
          otp: '12345',
          ip: '192.168.1.1',
        };

        //ERROR AL CONSUMIR SERVICIO
        const response = await axios.post('https://desarrollo.gti.fin.ec/boton-web-api-ws-1.0/coopagos/web/private/validation', solicitud, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('OK:', response.data);
        console.log(solicitud)
        setData(response.data);
      } catch (error) {
        console.error('Error al consumir el servicio privado:', error);
      }
    };

    consumirServicioPrivado();
    console.log('Institucion:', selectedInstitucion);
    console.log('Tipo de Identificación:', identificationType);
    console.log('Identificacion:', identificacion);
    console.log('Tipo de Cuenta:', tipoCuenta);
    console.log('Número de Cuenta:', numeroCuenta);
    console.log('Valor de la Transferencia:', valorTransferencia);

  };


  return (
    <>
      <div className="container">
        <div className="container d-flex align-items-center justify-content-center vh-100">
          <div className="col-md-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="tipoIdentificacion" className="form-label">Seleccione Institución:</label>
                <select id="institucion" className="form-control" value={selectedInstitucion} onChange={(e) => setSelectedInstitucion(e.target.value)}>
                  <option value="">Seleccionar institución</option>
                  {instituciones.map((x) => (
                    <option key={x.codigoInstitucion} value={x.codigoInstitucion}>
                      {x.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="tipoIdentificacion" className="form-label">Tipo de Identificación:</label>
                <select id="tipoIdentificacion" className="mb-3 form-select" value={identificationType} onChange={(e) => setIdentificationType(e.target.value)}>
                  <option value="C">Cédula</option>
                  <option value="P">Pasaporte</option>
                  <option value="R">RUC</option>
                </select>
                <input type="text" id="tipoIdentificacion" className="form-control" value={identificacion} onChange={(e) => setIdentificacion(e.target.value)} />
              </div>
              <div className="mb-3">
                <label htmlFor="tipoCuenta" className="form-label">Tipo de Cuenta:</label>
                <select id="tipoCuenta" className="form-select" value={tipoCuenta} onChange={(e) => setTipoCuenta(e.target.value)}>
                  <option value={1}>Ahorros</option>
                  <option value={2}>Corriente</option>
                  <option value={3}>Otra</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="numeroCuenta" className="form-label">Número de Cuenta:</label>
                <input type="number" id="numeroCuenta" className="form-control" value={numeroCuenta} onChange={(e) => setNumeroCuenta(e.target.value)} />
              </div>
              <div className="mb-3">
                <label htmlFor="valorTransferencia" className="form-label">Valor de la Transferencia:</label>
                <input type="text" id="valorTransferencia" className="form-control" value={valorTransferencia} onChange={(e) => setValorTransferencia(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" onClick={abrirModal}>Pagar</button>
            </form>
          </div>
        </div>
      </div>

      <Modal isOpen={modal.active}>
        <ModalHeader>{(data ? "Error al realizar la transacción" : "Transacción correcta")}</ModalHeader>
        <ModalBody>
          {(data ? "ERROR" : "Transacción realizada a " + data.debitPerson.name +
           " con C.I " + data.debitPerson.identification +", a la cuenta número "+data.debitPerson.accounts.account)}
        </ModalBody>
        <ModalFooter>
          <Button onClick={abrirModal}>Cerrar</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default App;