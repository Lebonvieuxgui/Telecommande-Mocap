/* This is the C++ source file of the class "MyTakeRecorderController" 
 * which needs to be added to your Unreal Project. 
 */

#include "MyTakeRecorderController.h"

// Sets default values
AMyTakeRecorderController::AMyTakeRecorderController()
{
	// Set this actor to call Tick() every frame.  You can turn this off to improve performance if you don't need it.
	PrimaryActorTick.bCanEverTick = true;

}

// Called when the game starts or when spawned
void AMyTakeRecorderController::BeginPlay()
{
	Super::BeginPlay();

}

// Called every frame
void AMyTakeRecorderController::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

}

void AMyTakeRecorderController::StartRecording(FString InSlate)
{
	UTakeRecorderPanel* Panel = UTakeRecorderBlueprintLibrary::GetTakeRecorderPanel();
	if (Panel != nullptr) {
		if (!IsRecording()) {
			SetSlate(InSlate, Panel);
			Panel->StartRecording();
		}
	}
	else {
		UE_LOG(LogTemp, Warning, TEXT("No TakeRecorderPanel found."));
	}
}

void AMyTakeRecorderController::StopRecording()
{
	UTakeRecorderPanel* Panel = UTakeRecorderBlueprintLibrary::GetTakeRecorderPanel();
	if (Panel != nullptr) {
		if (IsRecording()) {
			Panel->StopRecording();
		}
	}
	else {
		UE_LOG(LogTemp, Warning, TEXT("No TakeRecorderPanel found."));
	}
}

bool AMyTakeRecorderController::IsRecording()
{
	return UTakeRecorderBlueprintLibrary::IsRecording();
}

void AMyTakeRecorderController::SetSlate(FString InSlate, UTakeRecorderPanel* Panel) {
	ULevelSequence* Sequence = Panel->GetLevelSequence();
	if (Sequence != nullptr) {
		UTakeMetaData* MetaData = Sequence->FindOrAddMetaData<UTakeMetaData>();
		if (MetaData != nullptr) {
			MetaData->SetSlate(InSlate);
			MetaData->SetTakeNumber(1);
		}
		else {
			// Should not happen
			UE_LOG(LogTemp, Warning, TEXT("No TakeMetaData found."));
		}
	}
	else {
		UE_LOG(LogTemp, Warning, TEXT("No LevelSequence found."));
	}
}
