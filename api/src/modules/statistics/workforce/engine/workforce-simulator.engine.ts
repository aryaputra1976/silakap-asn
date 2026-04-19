export class WorkforceSimulatorEngine {

  simulate(
    gapAsn: number,
    pensiun5Tahun: number,
    rekrutmen: number
  ) {

    const kebutuhanTotal =
      gapAsn + pensiun5Tahun

    const gapSetelahRekrutmen =
      kebutuhanTotal - rekrutmen

    return {

      kebutuhanTotal,
      rekrutmen,
      gapSetelahRekrutmen

    }

  }

}