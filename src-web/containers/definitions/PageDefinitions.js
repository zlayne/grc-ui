/* Copyright (c) 2021 Red Hat, Inc. */
/* Copyright Contributors to the Open Cluster Management project */
/* eslint-disable react/display-name */

'use strict'
import React from 'react'
import { AcmButton, AcmSecondaryNavItem } from '@open-cluster-management/ui-components'

import { ALL_POLICIES, SINGLE_POLICY, POLICY_STATUS, POLICY_STATUS_HISTORY, POLICY_TEMPLATE_DETAILS } from '../../utils/client/queries'
import config from '../../../server/lib/shared/config'
// eslint-disable-next-line import/no-named-as-default
import GrcView from '../../components/modules/GrcView'
import { PolicyDetailsOverview } from '../../components/modules/PolicyDetailsOverview'
import PolicyStatusView from '../../components/modules/PolicyStatusView'
import PolicyTemplateDetailsView from '../../components/modules/PolicyTemplateDetailsView'
import PolicyStatusHistoryView from '../../components/modules/PolicyStatusHistoryView'
import msgs from '../../nls/platform.properties'
import { checkCreatePermission, checkEditPermission } from '../../utils/CheckUserPermission'

const policiesMsg = 'routes.policies'
const historyMsg = 'table.header.history'

export const getPageDefinition = (props) => {
  const { type } = props
  switch(type) {
    case 'ALL_POLICIES':
      return policiesPage(props)
    case 'SINGLE_POLICY':
      return policyDetailsPage(props)
    case 'POLICY_CLUSTERS':
      return policyClustersPage(props)
    case 'POLICY_TEMPLATES':
      return policyTemplatesPage(props)
    case 'POLICY_TEMPLATE_DETAILS':
      return policyTemplateDetailsPage(props)
    case 'POLICY_STATUS_HISTORY':
      return policyStatusHistoryPage(props)
  }
  return null
}

const createBtn = ({ userAccess, history, locale }) => {
  return (
    <AcmButton key='create-policy' id='create-policy' isDisabled={checkCreatePermission(userAccess)===0}
      tooltip={msgs.get('error.permission.disabled', locale)}
      onClick={() => history.push(`${config.contextPath}/create`)}>
      {msgs.get('routes.create.policy', locale)}
    </AcmButton>
  )
}

const editBtn = ({ userAccess, history, locale, name, namespace, resourceNotFound }) => {
  const noPermission = checkEditPermission(userAccess) === 0
  return (
    <AcmButton key='edit-policy' id='edit-policy' isDisabled={noPermission || resourceNotFound}
      tooltip={noPermission ? msgs.get('error.permission.disabled', locale) : msgs.get('error.not.found', locale)}
      onClick={() => history.push(`${config.contextPath}/all/${namespace}/${name}/edit`)}>
      {msgs.get('routes.edit.policy', locale)}
    </AcmButton>
  )
}

const detailsNav = ({ history, locale, name, namespace }) => {
  const url = `${config.contextPath}/all/${namespace}/${name}`
  return (
    <AcmSecondaryNavItem key='details' isActive={history.location.pathname===url}
      onClick={() => history.push(url)}>
      {msgs.get('tabs.details', locale)}
    </AcmSecondaryNavItem>
  )
}

const clustersNav = ({ history, locale, name, namespace }) => {
  const url = `${config.contextPath}/all/${namespace}/${name}/clusters`
  return (
    <AcmSecondaryNavItem key='clusters' isActive={history.location.pathname===url}
      onClick={() => history.push(url)}>
      {msgs.get('tabs.clusters', locale)}
    </AcmSecondaryNavItem>
  )
}

const templatesNav = ({ history, locale, name, namespace }) => {
  const url = `${config.contextPath}/all/${namespace}/${name}/templates`
  return (
    <AcmSecondaryNavItem key='templates' isActive={history.location.pathname===url}
      onClick={() => history.push(url)}>
      {msgs.get('tabs.templates', locale)}
    </AcmSecondaryNavItem>
  )
}

const policiesPage = ({ locale }) => {
  return {
    id: 'policies',
    title: msgs.get('routes.grc', locale),
    query: ALL_POLICIES,
    refreshControls: true,
    buttons: [ createBtn ],
    children: (props) => <GrcView {...props} />
  }
}

const policyDetailsPage = ({ name, namespace, locale }) => {
  return {
    id: 'policy-details',
    title: name,
    query: SINGLE_POLICY,
    query_variables: { name, namespace },
    refreshControls: true,
    breadcrumb: [
      { text: msgs.get(policiesMsg, locale), to: config.contextPath },
      { text: name, to: name }
    ],
    navigation: [
      detailsNav,
      clustersNav,
      templatesNav
    ],
    buttons: [ editBtn ],
    children: (props) => <PolicyDetailsOverview {...props} />
  }
}

const policyClustersPage = ({ name, namespace, locale }) => {
  return {
    id: 'policy-clusters',
    title: name,
    query: POLICY_STATUS,
    query_variables: { policyName: name, hubNamespace: namespace },
    refreshControls: true,
    breadcrumb: [
      { text: msgs.get(policiesMsg, locale), to: config.contextPath },
      { text: name, to: name }
    ],
    navigation: [
      detailsNav,
      clustersNav,
      templatesNav
    ],
    buttons: [ editBtn ],
    children: (props) => <PolicyStatusView {...props} grouping='clusters' />
  }
}

const policyTemplatesPage = ({ name, namespace, locale }) => {
  return {
    id: 'policy-templates',
    title: name,
    query: POLICY_STATUS,
    query_variables: { policyName: name, hubNamespace: namespace },
    refreshControls: true,
    breadcrumb: [
      { text: msgs.get(policiesMsg, locale), to: config.contextPath },
      { text: name, to: name }
    ],
    navigation: [
      detailsNav,
      clustersNav,
      templatesNav
    ],
    buttons: [ editBtn ],
    children: (props) => <PolicyStatusView {...props} grouping='templates' />
  }
}

const policyTemplateDetailsPage = ({ name, namespace, cluster, apiGroup, version, kind, template, locale }) => {
  const selfLink = `/apis/${apiGroup}/${version}/namespaces/${cluster}/${kind}/${template}`
  return {
    id: 'policy-template-details',
    title: template,
    query: POLICY_TEMPLATE_DETAILS,
    query_variables: { name:template, cluster, kind, selfLink },
    refreshControls: true,
    breadcrumb: [
      { text: msgs.get(policiesMsg, locale), to: config.contextPath },
      { text: name, to: `${config.contextPath}/all/${namespace}/${name}`},
      { text: template, to: template }
    ],
    children: (props) => <PolicyTemplateDetailsView {...props} selfLink={selfLink} />
  }
}

const policyStatusHistoryPage = ({ name, namespace, cluster, template, locale }) => {
  return {
    id: 'policy-status-history',
    title: msgs.get(historyMsg, locale),
    query: POLICY_STATUS_HISTORY,
    query_variables: { policyName: name, hubNamespace: namespace, cluster, template },
    refreshControls: true,
    breadcrumb: [
      { text: msgs.get(policiesMsg, locale), to: config.contextPath },
      { text: name, to: `${config.contextPath}/all/${namespace}/${name}`},
      { text: msgs.get(historyMsg, locale), to: msgs.get(historyMsg, locale) }
    ],
    children: (props) => <PolicyStatusHistoryView {...props} cluster={cluster} template={template} />
  }
}

