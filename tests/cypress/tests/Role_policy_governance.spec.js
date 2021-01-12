/* Copyright (c) 2020 Red Hat, Inc. */
/// <reference types="cypress" />
import { test_genericPolicyGovernance } from './common/generic_policies_governance.spec.js'
import { cleanup_usingPolicyYAML } from './common/generic_policy_cleanup.js'

test_genericPolicyGovernance('Role policy governance', 'Role_policy_governance/policy-config.yaml', 'Role_policy_governance/violations-inform.yaml', 'Role_policy_governance/violations-enforce.yaml')

describe('Role policy governance - clean up', () => {
  cleanup_usingPolicyYAML('Role_policy_governance/role_specification_cleanup_policy_raw.yaml')
})