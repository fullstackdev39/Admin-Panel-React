import React from "react";
import {
  Portlet,
  PortletBody
} from "../../partials/content/Portlet";
import DashboardEventPanel from "../../adminpanel/DashboardEventPanel";
import DashboardEventTable from "../../adminpanel/DashboardEventTable";
import { connect } from "react-redux";
import * as builder from "../../../_metronic/ducks/builder";
import '../../adminpanel/css/style.css';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Delete';
import { CircularProgress } from "@material-ui/core";

class EventDetail extends React.Component {
  constructor(props){
    super(props);
    const { params } = this.props.match;
    this.state={
      eventId : params.id,
      uploadDlgOpen : false,
      background: '#fff',
      pointerEvents: 'all',
      display:'none',
      file:'',
      errorDlgOpen : false,
      showData:{}
    }
  }

  async componentDidMount() {
    const {store, dispatch} = this.props;
    var layoutConfig = store.builder.layoutConfig;
    layoutConfig.loadingCSS = {
      display : 'block',
      opacity:'0.5',
      pointerEvents:'none'
    };
    dispatch(builder.actions.setLayoutConfigs(layoutConfig));
    const response = await fetch(`https://dev.imcado.app/event/` + this.state.eventId,
      {
      method : 'GET',
      mode: 'cors',
      headers:{
        'Content-Type': 'application/json',
        'x-zumo-auth' : store.auth.user.xZumoAuth
      }
    });
    var data = await response.json();
    this.setState({showData:data});
    layoutConfig.loadingCSS = {
      display : 'none',
      opacity:'1',
      pointerEvents:'all'
    };
    dispatch(builder.actions.setLayoutConfigs(layoutConfig));
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if(nextProps.match.params.id !== prevState.eventId) {
      return {
        eventId : nextProps.match.params.id
      }
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevState.eventId !== this.state.eventId){
      const {store, dispatch} = this.props;
    
      var layoutConfig = store.builder.layoutConfig;
      layoutConfig.loadingCSS = {
        display : 'block',
        opacity:'0.5',
        pointerEvents:'none'
      };
      dispatch(builder.actions.setLayoutConfigs(layoutConfig));

      fetch(`https://dev.imcado.app/event/` + this.state.eventId,
        {
        method : 'GET',
        mode: 'cors',
        headers:{
          'Content-Type': 'application/json',
          'x-zumo-auth' : store.auth.user.xZumoAuth
        }
      })
      .then(res => res.json())
      .then(data=> {
        this.setState({showData:data});
        layoutConfig.loadingCSS = {
          display : 'none',
          opacity:'1',
          pointerEvents:'all'
        };
        dispatch(builder.actions.setLayoutConfigs(layoutConfig));
      });
    }
  }
  
  uploadClick = () =>{
    this.setState({
      uploadDlgOpen : true
    });
  }

  handleUpload = () =>{
    const {store, dispatch} = this.props;
    if (!this.state.file || this.state.size === 0){
      this.setState({errorDlgOpen : true});
    }
    else{
      // console.log(this.state.file);
      this.setState(
        {
          background: '#ddd',
          pointerEvents: 'none',
          display:'block'
        }
      );
      fetch(`https://dev.imcado.app/event/` + this.state.eventId + '/logo',
      {
        method : 'POST',
        mode: 'cors',
        headers:{
          'Content-Type': 'application/octet-stream',
          'x-zumo-auth' : store.auth.user.xZumoAuth,
          'FileContentType': 'image/png'
        },
        body:this.state.file
      })
      .then(res =>{
        if (res.status === 202){
          setTimeout(function() { //Start the timer
            var layoutConfig = store.builder.layoutConfig;
            layoutConfig.loadingCSS = {
              display : 'block',
              opacity:'0.5',
              pointerEvents:'none'
            };
            dispatch(builder.actions.setLayoutConfigs(layoutConfig));
  
            fetch(`https://dev.imcado.app/event/` + this.state.eventId,
              {
              method : 'GET',
              mode: 'cors',
              headers:{
                'Content-Type': 'application/json',
                'x-zumo-auth' : store.auth.user.xZumoAuth
              }
            })
            .then(res => res.json())
            .then(data=> {
              this.setState({showData:data});
              layoutConfig.loadingCSS = {
                display : 'none',
                opacity:'1',
                pointerEvents:'all'
              };
              dispatch(builder.actions.setLayoutConfigs(layoutConfig));
              this.setState({
                uploadDlgOpen : false
              });
              this.setState(
                {
                  background: '#fff',
                  pointerEvents: 'all',
                  display:'none'
                }
              );
            });
          }.bind(this), 1500)
        }
        else {
          this.setState(
            {
              background: '#fff',
              pointerEvents: 'all',
              display:'none'
            }
          );
          this.setState({errorDlgOpen : true});
        }
      })
    }
    
  }

  handleUploadCancel = () =>{
    this.setState({
      uploadDlgOpen : false
    });
  }

  _handleImageChange =(e) =>{
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0){
      let reader = new FileReader();
      let file = e.target.files[0];

      reader.onloadend = () => {
        this.setState({
          file: file
        });
        var regex = new RegExp('[^.]+$'); 
        if (this.state.file.name.match(regex)[0] === "png" || this.state.file.name.match(regex)[0] === "tiff"  || this.state.file.name.match(regex)[0] === "jpg" || this.state.file.name.match(regex)[0] === "gif"){

        }
        else {
          this.setState({errorDlgOpen : true});
        }
      }
      reader.readAsDataURL(file)
    }
    else {
      this.setState({file:''});
    }
  }

  render() {
    var startDate = new Date(this.state.showData.StartDateTime);
    var endDate = new Date(this.state.showData.EndDateTime);
    startDate = (startDate.getMonth()+1) + '/' + startDate.getDate() + "/" + startDate.getFullYear();
    endDate = (endDate.getMonth()+1) + '/' + endDate.getDate() + "/" + endDate.getFullYear();

    return (
      <>
      <div>
      <Dialog
        open={this.state.uploadDlgOpen}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div style={{background:this.state.background, pointerEvents:this.state.pointerEvents}}>
            <CircularProgress className="kt-splash-screen__spinner" style={{position: 'absolute','zIndex': '1','top': '45%','left': '48%', display:this.state.display}} />
            <DialogTitle id="alert-dialog-title">{"Upload Logo"}</DialogTitle>
            <DialogContent style={{"marginTop":"0px"}}>
              <input className="fileInput" 
                type="file" 
                onChange={(e)=>this._handleImageChange(e)} 
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleUpload} color="primary" autoFocus>
                Upload
              </Button>
              <Button onClick={this.handleUploadCancel} color="primary">
                Cancel
              </Button>
            </DialogActions>
            </div>
        </Dialog>
        <Dialog open={this.state.errorDlgOpen}>
          <DialogTitle id="alert-dialog-title">{"Error"}</DialogTitle>
            <DialogContent style={{"marginTop":"0px"}}>
              You should upload image like *.png, *.tiff, *.jpg, *.gif
           </DialogContent>
          <DialogActions>
              <Button onClick={() => this.setState({errorDlgOpen : false})} color="primary">
                OK
              </Button>
          </DialogActions>
        </Dialog>
        <div className="row">
          <div className="col-md-4">      
            <Portlet className="kt-portlet--border-bottom-brand">
              <PortletBody fluid={true} style={{padding:"15px"}}>
                <div className="kt-widget26" style={{height:'160px'}}>
                    <span >Event</span>
                    <span style={{'fontSize':'40px', 'textAlign':'center', 'paddingTop':'20px','paddingBottom':'20px', height:'100px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace:'nowrap'}} title={this.state.showData.Name}>{this.state.showData.Name}</span>
                    <div style={{'textAlign':'right', 'height':'19.2px'}}>
                      <span style={{paddingRight:"5px"}}>{startDate}</span>
                      -
                      <span style={{paddingLeft:"5px"}}>{endDate}</span>
                    </div>
                </div>
              </PortletBody>
            </Portlet>
          </div>
          <div className="col-md-4">      
            <Portlet className="kt-portlet--border-bottom-brand">
              <PortletBody fluid={true} style={{padding:"15px"}}>
                <div className="hovereffect">
                    <span style={{float:'left'}}>Logo</span>
                    <img className="img-responsive" src={this.state.showData.LogoLink} alt=""></img>
                    <div className="overlay">
                      <Button className="info" onClick={this.uploadClick}>
                        <CloudUploadIcon style={{fontSize: '3.5rem'}}/>
                      </Button>
                      <Button className="info" >
                        <DeleteIcon style={{fontSize: '3.3rem'}}/>
                      </Button>
                    </div>
                </div>
              </PortletBody>
            </Portlet>
          </div>
          
          <div className="col-md-4">      
            <Portlet className="kt-portlet--border-bottom-brand" style={{marginBottom:'10px'}}>
              <PortletBody fluid={true} style={{padding:"15px"}}>
                <div className="hovereffect" style={{height:'58px'}}>
                  <span style={{float:'left'}}>Number of photos</span>
                  <span style={{fontSize:"40pt", position:'absolute', top:'-5px', right:'90px'}}>{this.state.showData.NumberOfPhotos}</span>
                </div>
              </PortletBody>
            </Portlet>
            <Portlet className="kt-portlet--border-bottom-brand">
              <PortletBody fluid={true} style={{padding:"15px"}}>
                <div className="hovereffect" style={{height:'58px'}}>
                  <span style={{float:'left'}}>Number of participants</span>
                  <span style={{fontSize:"40pt", position:'absolute', top:'-5px', right:'90px'}}>{this.state.showData.NumberOfParticipants}</span>
                </div>
              </PortletBody>
            </Portlet>
          </div>
        </div>
       </div> 
      </>
    );
  }
}
const mapStateToProps = store => ({
  store
});

export default connect(mapStateToProps)(EventDetail);