import React from "react";
import {
  Portlet,
  PortletBody
} from "../../partials/content/Portlet";
import DashboardEventPanel from "../../adminpanel/DashboardEventPanel";
import DashboardEventTable from "../../adminpanel/DashboardEventTable";
import { connect } from "react-redux";
import * as builder from "../../../_metronic/ducks/builder";

class Dashboard extends React.Component {
  constructor(props){
    super(props);
    this.newFindClosest = this.newFindClosest.bind(this);
  }

  async componentDidMount() {
    const {store, dispatch} = this.props;
    const response = await fetch(`https://dev.imcado.app/events`,
      {
      method : 'GET',
      mode: 'cors',
      headers:{
        'Content-Type': 'application/json',
        'x-zumo-auth' : store.auth.user.xZumoAuth
      }
    });
    var data = await response.json();
    data.Items = data.Items.sort(function(a, b){
      return new Date(a.StartDateTime) - new Date(b.StartDateTime);
    });
    var idx = this.newFindClosest(data);
    
    const response_event = await fetch(`https://dev.imcado.app/event/` + data.Items[idx].EventId,
    {
      method : 'GET',
      mode: 'cors',
      headers:{
        'Content-Type': 'application/json',
        'x-zumo-auth' : store.auth.user.xZumoAuth
      }
    });
    var nearData = await response_event.json();
    
    dispatch(builder.actions.setDashboardConfig({
      nearData : nearData,
      events : data
    }));

    var layoutConfig = store.builder.layoutConfig;
    layoutConfig.loadingCSS = {
      display : 'none',
      opacity:'1',
      pointerEvents:'all'
    };
    dispatch(builder.actions.setLayoutConfigs(layoutConfig));
  }

  newFindClosest(data){
    var testDate = new Date();
    var after = [];
    var max = data.Items.length;
    for(var i = 0; i < max; i++) {
        var tar = data.Items[i].StartDateTime;
        var arrDate = new Date(tar);
        // 3600 * 24 * 1000 = calculating milliseconds to days, for clarity.
        var diff = (arrDate - testDate) / (3600 * 24 * 1000);
        if(diff > 0) {
          after.push({diff: diff, index: i});
        }
    }

    after.sort(function(a, b) {
        if(a.diff > b.diff) {
            return 1;
        }
        if(a.diff < b.diff) {
            return -1;
        }
        return 0;
    });
    return after[0].index;
  }

  render() {
    const {store} = this.props;
    if (store.builder.dashboardConfig !== undefined){
      store.builder.dashboardConfig.nearData.StartDateTime = new Date(store.builder.dashboardConfig.nearData.StartDateTime);
      store.builder.dashboardConfig.nearData.EndDateTime = new Date(store.builder.dashboardConfig.nearData.EndDateTime);
    }
    return (
      <>
      <div>
        <div className="row">
          <div className="col-md-4">      
            <Portlet className="kt-portlet--border-bottom-brand">
              <PortletBody fluid={true} style={{padding:"15px"}}>
                <DashboardEventPanel
                  lefTopTitle="Next Event"
                  mainTitle={ store.builder.dashboardConfig && store.builder.dashboardConfig.nearData.Name}
                  fromDate={store.builder.dashboardConfig && ((store.builder.dashboardConfig.nearData.StartDateTime.getMonth()+1) + '/' + store.builder.dashboardConfig.nearData.StartDateTime.getDate() + "/" + store.builder.dashboardConfig.nearData.StartDateTime.getFullYear())}
                  toDate={store.builder.dashboardConfig && ((store.builder.dashboardConfig.nearData.EndDateTime.getMonth()+1) + '/' + store.builder.dashboardConfig.nearData.EndDateTime.getDate() + "/" + store.builder.dashboardConfig.nearData.EndDateTime.getFullYear())}
                />
              </PortletBody>
            </Portlet>
          </div>
          <div className="col-md-4">      
            <Portlet className="kt-portlet--border-bottom-brand">
              <PortletBody fluid={true} style={{padding:"15px"}}>
                <DashboardEventPanel
                  lefTopTitle="Number of photos"
                  mainTitle={ store.builder.dashboardConfig && store.builder.dashboardConfig.nearData.NumberOfPhotos}
                  fromDate=""
                  toDate=""
                />
              </PortletBody>
            </Portlet>
          </div>
          <div className="col-md-4">      
            <Portlet className="kt-portlet--border-bottom-brand">
              <PortletBody fluid={true} style={{padding:"15px"}}>
                <DashboardEventPanel
                  lefTopTitle="Number of participants"
                  mainTitle={store.builder.dashboardConfig && store.builder.dashboardConfig.nearData.NumberOfParticipants}
                  fromDate=""
                  toDate=""
                />
              </PortletBody>
            </Portlet>
          </div>
          <div className="col-md-12">
            <DashboardEventTable />
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

export default connect(mapStateToProps)(Dashboard);