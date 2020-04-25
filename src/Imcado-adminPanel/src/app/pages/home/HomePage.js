import React, { Suspense, lazy } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Builder from "./Builder";
import Dashboard from "./Dashboard";
import EventDetail from "./EventDetail"
import { LayoutSplashScreen } from "../../../_metronic";

const GoogleMaterialPage = lazy(() =>
  import("./google-material/GoogleMaterialPage")
);

export default function HomePage() {
  // useEffect(() => {
  //   console.log('Home page');
  // }, []) // [] - is required if you need only one call
  // https://reactjs.org/docs/hooks-reference.html#useeffect

  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <Switch>
        {
          /* Redirect from root URL to /dashboard. */
          <Redirect exact from="/" to="/dashboard" />
        }
        <Route path="/builder" component={Builder} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/google-material" component={GoogleMaterialPage} />
        
        <Route path='/eventdetail/:id' component={EventDetail} />
        <Redirect to="/error/error-v1" />
      </Switch>
    </Suspense>
  );
}
