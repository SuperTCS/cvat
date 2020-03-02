// Copyright (C) 2020 Intel Corporation
//
// SPDX-License-Identifier: MIT

import 'antd/dist/antd.less';
import '../styles.scss';
import React from 'react';
import { GlobalHotKeys, KeyMap } from 'react-hotkeys';
import { BrowserRouter } from 'react-router-dom';
import {
    Switch,
    Route,
    Redirect,
} from 'react-router';
import {
    Spin,
    Layout,
    notification,
} from 'antd';

import ShorcutsDialog from 'components/shortcuts-dialog/shortcuts-dialog';
import SettingsPageContainer from 'containers/settings-page/settings-page';
import TasksPageContainer from 'containers/tasks-page/tasks-page';
import CreateTaskPageContainer from 'containers/create-task-page/create-task-page';
import TaskPageContainer from 'containers/task-page/task-page';
import ModelsPageContainer from 'containers/models-page/models-page';
import CreateModelPageContainer from 'containers/create-model-page/create-model-page';
import AnnotationPageContainer from 'containers/annotation-page/annotation-page';
import LoginPageContainer from 'containers/login-page/login-page';
import RegisterPageContainer from 'containers/register-page/register-page';
import HeaderContainer from 'containers/header/header';

import { NotificationsState } from 'reducers/interfaces';

type CVATAppProps = {
    loadFormats: () => void;
    loadUsers: () => void;
    loadAbout: () => void;
    verifyAuthorized: () => void;
    initPlugins: () => void;
    resetErrors: () => void;
    resetMessages: () => void;
    showShortcutsHelp: () => void;
    hideShortcutsHelp: () => void;
    userInitialized: boolean;
    pluginsInitialized: boolean;
    pluginsFetching: boolean;
    formatsInitialized: boolean;
    formatsFetching: boolean;
    usersInitialized: boolean;
    usersFetching: boolean;
    aboutInitialized: boolean;
    aboutFetching: boolean;
    installedAutoAnnotation: boolean;
    installedTFAnnotation: boolean;
    installedTFSegmentation: boolean;
    notifications: NotificationsState;
    user: any;
};

export default class CVATApplication extends React.PureComponent<CVATAppProps> {
    public componentDidMount(): void {
        const { verifyAuthorized } = this.props;
        verifyAuthorized();
    }

    public componentDidUpdate(): void {
        const {
            loadFormats,
            loadUsers,
            loadAbout,
            initPlugins,
            userInitialized,
            formatsInitialized,
            formatsFetching,
            usersInitialized,
            usersFetching,
            aboutInitialized,
            aboutFetching,
            pluginsInitialized,
            pluginsFetching,
            user,
        } = this.props;

        this.showErrors();
        this.showMessages();

        if (!userInitialized || user == null) {
            // not authorized user
            return;
        }

        if (!formatsInitialized && !formatsFetching) {
            loadFormats();
        }

        if (!usersInitialized && !usersFetching) {
            loadUsers();
        }

        if (!aboutInitialized && !aboutFetching) {
            loadAbout();
        }

        if (!pluginsInitialized && !pluginsFetching) {
            initPlugins();
        }
    }

    private showMessages(): void {
        function showMessage(title: string): void {
            notification.info({
                message: (
                    <div
                        // eslint-disable-next-line
                        dangerouslySetInnerHTML={{
                            __html: title,
                        }}
                    />
                ),
                duration: null,
            });
        }

        const {
            notifications,
            resetMessages,
        } = this.props;

        let shown = false;
        for (const where of Object.keys(notifications.messages)) {
            for (const what of Object.keys(notifications.messages[where])) {
                const message = notifications.messages[where][what];
                shown = shown || !!message;
                if (message) {
                    showMessage(message);
                }
            }
        }

        if (shown) {
            resetMessages();
        }
    }

    private showErrors(): void {
        function showError(title: string, _error: any): void {
            const error = _error.toString();
            notification.error({
                message: (
                    <div
                        // eslint-disable-next-line
                        dangerouslySetInnerHTML={{
                            __html: title,
                        }}
                    />
                ),
                duration: null,
                description: error.length > 200 ? 'Open the Browser Console to get details' : error,
            });

            console.error(error);
        }

        const {
            notifications,
            resetErrors,
        } = this.props;

        let shown = false;
        for (const where of Object.keys(notifications.errors)) {
            for (const what of Object.keys(notifications.errors[where])) {
                const error = notifications.errors[where][what];
                shown = shown || !!error;
                if (error) {
                    showError(error.message, error.reason);
                }
            }
        }

        if (shown) {
            resetErrors();
        }
    }

    // Where you go depends on your URL
    public render(): JSX.Element {
        const {
            userInitialized,
            usersInitialized,
            aboutInitialized,
            pluginsInitialized,
            formatsInitialized,
            installedAutoAnnotation,
            installedTFSegmentation,
            installedTFAnnotation,
            user,
            showShortcutsHelp,
            hideShortcutsHelp,
        } = this.props;

        const readyForRender = (userInitialized && user == null)
            || (userInitialized && formatsInitialized
            && pluginsInitialized && usersInitialized && aboutInitialized);

        const withModels = installedAutoAnnotation
            || installedTFAnnotation || installedTFSegmentation;

        const keyMap = {
            SHOW_SHORTCUTS: {
                name: 'Show shortcuts',
                description: 'Open a list of available shortcuts',
                sequence: 'f1',
                action: 'keydown',
            },
            HIDE_SHORTCUTS: {
                name: 'Hide shortcuts',
                description: 'Close the list of available shortcuts',
                sequence: 'f1',
                action: 'keyup',
            },
        };

        const handlers = {
            SHOW_SHORTCUTS: (event: KeyboardEvent | undefined) => {
                if (event) {
                    event.preventDefault();
                }
                showShortcutsHelp();
            },
            HIDE_SHORTCUTS: (event: KeyboardEvent | undefined) => {
                if (event) {
                    event.preventDefault();
                }
                hideShortcutsHelp();
            },
        };

        if (readyForRender) {
            if (user) {
                return (
                    <BrowserRouter>
                        <Layout>
                            <HeaderContainer> </HeaderContainer>
                            <Layout.Content>
                                <ShorcutsDialog />
                                <GlobalHotKeys
                                    keyMap={keyMap as KeyMap}
                                    handlers={handlers}
                                >
                                    <Switch>
                                        <Route exact path='/settings' component={SettingsPageContainer} />
                                        <Route exact path='/tasks' component={TasksPageContainer} />
                                        <Route exact path='/tasks/create' component={CreateTaskPageContainer} />
                                        <Route exact path='/tasks/:id' component={TaskPageContainer} />
                                        <Route exact path='/tasks/:tid/jobs/:jid' component={AnnotationPageContainer} />
                                        { withModels
                                            && <Route exact path='/models' component={ModelsPageContainer} /> }
                                        { installedAutoAnnotation
                                            && <Route exact path='/models/create' component={CreateModelPageContainer} /> }
                                        <Redirect push to='/tasks' />
                                    </Switch>
                                </GlobalHotKeys>
                                {/* eslint-disable-next-line */}
                                <a id='downloadAnchor' style={{ display: 'none' }} download/>
                            </Layout.Content>
                        </Layout>
                    </BrowserRouter>
                );
            }

            return (
                <BrowserRouter>
                    <Switch>
                        <Route exact path='/auth/register' component={RegisterPageContainer} />
                        <Route exact path='/auth/login' component={LoginPageContainer} />
                        <Redirect to='/auth/login' />
                    </Switch>
                </BrowserRouter>
            );
        }

        return (
            <Spin size='large' className='cvat-spinner' />
        );
    }
}
