import React, {Component} from 'react'; // si je ne vais pas chercher dans mes fichiers c'est que j'importe implicitement un node module
import { getToflitFlowsByCsv } from '../../helpers/misc';

class GetToflitFlowsComponent extends Component {
  constructor(props) {
    this.state = {
      loading: false,
      data: null
    }
  }
  componentDidMount = () => {
    getToflitFlowsByCsv({
      year: 1789,
      customs_region: "La Rochelle",
      partner: "Portugal"
    })
    .then((newData) => {
        this.setState({data: newData});
        this.setState({loading: false});
    })
    .catch((err) => {
      this.setState({loading: false});
    })
  }

  render () {

    const {
      data,
      loading
    } = this.state;

    const setData = data => {
      setState({
        data
      })
    }

    const setLoading = loading => {
      setState({
        loading
      })
    }

    if (loading) {
        return (
            <div>Chargement des flows Toflit ...</div>
        )
    } else if (!data) {
        return (
            <div>Erreur ...</div>
        )
    }
    return ( 
        <p>
            {data.map(row => <div>{`${row.year}, ${row.customs_region}, ${row.partner}`}</div>)}
        </p>
    );

  }
}


export default GetToflitFlowsComponent;