import { Card } from "@/components/card"
import { Heading } from "@/components/heading"
import { Table, TableCell, TableRow } from "@/components/table"
import { ValidatorRow } from "@/types/faker"
import { Row } from "./row"
import { useDelegationInfo } from "@/hooks/useDelegationInfo"
import { Message } from "@/components/message"
import { useMemo } from "react"

export const Active = () => {
  const { delegationsByValidator } = useDelegationInfo()

  const validators: ValidatorRow[] = useMemo(
    () =>
      delegationsByValidator.map((validator) => ({
        address: validator.validatorAddress,
        name: validator.moniker,
        commission: validator.commission,
        apy: validator.apr,
        assets: validator.tokens,
        rewards: validator.rewards,
        rewardsPrice: validator.rewardsPrice
      })),
    [delegationsByValidator]
  )

  return (
    <Card auto>
      <Heading icon="hugeicons:coins-bitcoin" title="Active Delegations" />
      <Table>
        <thead>
          <TableRow>
            <TableCell>Validator</TableCell>
            <TableCell>Staked Assets</TableCell>
            <TableCell>APY</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </thead>
        <tbody>
          {validators.map((validator) => (
            <Row key={validator.address} {...validator} />
          ))}
        </tbody>
      </Table>
      {validators.length === 0 && (
        <Message title="Delegations informations" variant="primary">
          No delegation found.
        </Message>
      )}
    </Card>
  )
}