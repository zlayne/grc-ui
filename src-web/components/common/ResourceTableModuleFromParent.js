/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
'use strict'
/*eslint-disable*/
import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Module, ModuleHeader, ModuleBody } from 'carbon-addons-cloud-react'
import lodash from 'lodash'
import msgs from '../../../nls/platform.properties'
import ResourceTable from '../../components/common/ResourceTable'
import TableHelper from '../../util/table-helper'
import {updateSecondaryHeader} from '../../actions/common'

class ResourceTableModule extends React.Component {
  static propTypes = {
    definitionsKey: PropTypes.string,
    normalizedKey: PropTypes.string,
    resourceType: PropTypes.object,
    staticResourceData: PropTypes.object,
    subResourceType: PropTypes.object,
    tableResources: PropTypes.array,
  }

  constructor(props) {
    super(props)
    this.handleSearch = this.handleSearch.bind(this)
    this.handleSort = this.handleSort.bind(this)
    this.formatResourceData = this.formatResourceData.bind(this)
    this.handleSearch=TableHelper.handleInputValue.bind(this, this.handleSearch)
    this.state = {
      resourceItems: [],
      resourceIds: [],
      sortDirection: 'asc',
      searchValue: ''
    }
  }

  componentWillMount() {
    this.formatResourceData()
    const { tabs, title, breadcrumbItems } = this.props.secondaryHeaderProps
    const { updateSecondaryHeader } = this.props
    if (/^#.+#$/.test(title)) {
      updateSecondaryHeader(title.replace(/#/g, ''), tabs, breadcrumbItems)
    } else {
      updateSecondaryHeader(msgs.get(title, this.context.locale), tabs, breadcrumbItems)
    }
  }

  componentWillReceiveProps(nextProps) {
    const { tableResources } = this.props
    if (nextProps.tableResources !== tableResources) {
      this.formatResourceData(nextProps.tableResources)
    }
  }

  render() {
    const { staticResourceData, resourceType } = this.props
    const { resourceItems, resourceIds, searchValue, sortDirection } = this.state
    return (
        <ResourceTable
          items={resourceItems || []}
          itemIds={resourceIds || []}
          staticResourceData={staticResourceData}
          resourceType={resourceType}
          totalFilteredItems={resourceIds && resourceIds.length}
          handleSort={this.handleSort}
          handleSearch={this.handleSearch}
          searchValue={searchValue}
          darkSearchBox={true}
          sortDirection={sortDirection}
          tableActions={staticResourceData.tableActions}
        />
    )
  }

  createNormalizedItems(input, normalizedKey) {
    if (input) {
      return lodash.keyBy(input, repo => normalizedKey? `${lodash.get(repo, normalizedKey)}${lodash.get(repo, 'cluster', '')}`: lodash.get(repo, 'name', ''))
    }
    return []
  }

  formatResourceData(inputData) {
    let { tableResources } = this.props
    const { normalizedKey } = this.props
    if (inputData) tableResources = inputData
    const { searchValue } = this.state
    let normalizedItems = this.createNormalizedItems(tableResources, normalizedKey)
    let itemIds = Object.keys(normalizedItems)
    if (searchValue) {
      itemIds = itemIds.filter(repo => repo.includes(searchValue))
      normalizedItems = lodash.pick(normalizedItems, itemIds)
    }
    this.setState({ resourceItems: normalizedItems, resourceIds: itemIds })
  }

  // handleSearch will only search for a specific id column
  handleSearch(searchValue) {
    if (!searchValue) {
      return this.setState({ searchValue: '' }, this.formatResourceData)
    }
    this.setState((prevState) => {
      let resItems = prevState.resourceItems
      let resIds = prevState.resourceIds
      resIds = resIds.filter(repo => repo.includes(searchValue))
      resItems = lodash.pick(resItems, resIds)
      return { resourceItems: resItems, resourceIds: resIds, searchValue }
    })
  }
  handleSort(key) {
    const target = key.currentTarget
    const selectedKey = target && target.getAttribute('data-key')
    if (selectedKey) {
      const { staticResourceData, definitionsKey } = this.props
      const resourceKeys = staticResourceData[definitionsKey]
      const { resourceItems, sortDirection } = this.state
      const sortKey = resourceKeys.tableKeys.find(tableKey => tableKey.resourceKey === selectedKey).resourceKey
      const sortedRes = lodash.orderBy(resourceItems, [sortKey], [sortDirection])

      const { normalizedKey } = resourceKeys
      const normalizedItems = this.createNormalizedItems(sortedRes, normalizedKey)
      const itemIds = Object.keys(normalizedItems)
      this.setState({ resourceIds: itemIds, resourceItems: normalizedItems, sortDirection: sortDirection === 'asc' ? 'desc' : 'asc' })
    }
  }
}

ResourceTableModule.contextTypes = {
  locale: PropTypes.string
}



const mapDispatchToProps = (dispatch) => {
  return {
    updateSecondaryHeader: (title, tabs, breadcrumbItems) => dispatch(updateSecondaryHeader(title, tabs, breadcrumbItems)),
  }
}

export default withRouter(connect(null, mapDispatchToProps)(ResourceTableModule))