import React, { Fragment, useState, useEffect } from 'react';

import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

//components
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const setAuth = (boolean) => {
        setIsAuthenticated(boolean);
    };

    async function isAuth() {
        try {
            const response = await fetch('http://localhost:5000/auth/is-verify', {
                method: 'GET',
                headers: { token: localStorage.token },
            });

            const parseRes = await response.json();

            parseRes === true ? setIsAuthenticated(true) : setIsAuthenticated(false);
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        isAuth();
    });

    return (
        <div className='App'>
            <Fragment>
                <Router>
                    <div class='container'>
                        <Switch>
                            <Route
                                exact
                                path='/login'
                                render={(props) =>
                                    !isAuthenticated ? (
                                        <Login {...props} setAuth={setAuth} />
                                    ) : (
                                        <Redirect to='/dashboard' />
                                    )
                                }
                            />
                            {/* we use "render",instead of "component",because we don't want to remount*/}
                            <Route
                                exact
                                path='/register'
                                render={(props) =>
                                    !isAuthenticated ? (
                                        <Register {...props} setAuth={setAuth} />
                                    ) : (
                                        <Redirect to='/login' />
                                    )
                                }
                            />
                            <Route
                                exact
                                path='/dashboard'
                                render={(props) =>
                                    isAuthenticated ? (
                                        <Dashboard {...props} setAuth={setAuth} />
                                    ) : (
                                        <Redirect to='/login' />
                                    )
                                }
                            />
                        </Switch>
                    </div>
                </Router>
            </Fragment>
        </div>
    );
}

export default App;
