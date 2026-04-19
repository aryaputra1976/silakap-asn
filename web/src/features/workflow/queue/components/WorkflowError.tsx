interface Props {
  message: string
}

export function WorkflowError({ message }: Props) {

  if (!message) return null

  return (
    <div className="alert alert-danger">

      <strong>Workflow Error:</strong> {message}

    </div>
  )
}